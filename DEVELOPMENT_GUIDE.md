# OpenVision 开发规范

> 所有开发者必读。发现问题直接在 Discord 提，规范会持续更新。

---

## 一、架构总览

```
前端 (Next.js/React, port 3001)
  └── src/api/         ← API 客户端层，统一封装
  └── src/pages/       ← 页面组件
  └── src/components/  ← 公共组件

后端 (FastAPI, port 8000)
  └── app/api/v1/endpoints/  ← 路由层，只做请求/响应处理
  └── app/services/          ← 业务逻辑层
  └── app/models/            ← 数据库模型 (SQLAlchemy)
  └── app/schemas/           ← Pydantic 数据校验
```

**原则：路由层薄，业务逻辑在 service 层。**

---

## 二、后端规范

### 2.1 API 响应格式

**列表接口统一返回 `{total, items}`：**
```python
# ✅ 正确
return {"total": total, "items": items}

# ❌ 错误（直接返回数组）
return items
```

**单个资源返回对象本身，错误用 HTTPException：**
```python
# ✅ 正确
raise HTTPException(status_code=404, detail="设备不存在")

# ❌ 错误（自定义格式）
return {"error": "设备不存在"}
```

### 2.2 字段命名规范

- 全部使用 **snake_case**（下划线）
- 布尔字段前缀：`is_` 或 `has_`（`is_active`, `is_read`, `has_error`）
- 时间字段后缀：`_at`（`created_at`, `updated_at`, `resolved_at`）
- 状态枚举写注释说明可选值

```python
status = Column(String(20), default="offline")  # online/offline/error
severity = Column(String(20), default="medium")  # low/medium/high/critical
```

### 2.3 Schema 字段必须与 Model 对齐

新增 Model 字段时，同步更新对应的 Schema：
- `DeviceCreate` ← 创建时允许传的字段
- `DeviceUpdate` ← 更新时允许传的字段（全部 Optional）
- `DeviceResponse` ← 返回给前端的字段

### 2.4 数据库操作规范

- **软删除**：不要真删数据，用 `is_active = False`
- **时间**：统一用 `datetime.now(timezone.utc)`，不要 `datetime.now()`
- **查询**：filter 条件放在一起，最后 `.order_by().offset().limit()`

### 2.5 错误处理

```python
# ✅ 正确
device = db.query(Device).filter(Device.id == device_id).first()
if not device:
    raise HTTPException(status_code=404, detail="设备不存在")

# 通用异常
try:
    ...
except Exception as e:
    raise HTTPException(status_code=500, detail=f"操作失败: {str(e)}")
```

---

## 三、前端规范

### 3.1 API 调用统一走 `src/api/` 层

```ts
// ✅ 正确 - 在 api/ 层封装，页面调用
import { alertsApi } from '../../api/alerts';
const res = await alertsApi.list({ limit: 50 });

// ❌ 错误 - 页面里直接 fetch
const res = await fetch('/api/v1/alerts/');
```

### 3.2 列表接口返回格式适配

后端列表接口统一返回 `{total, items}`，前端这样处理：

```ts
// api 层定义
export interface AlertListResponse {
  total: number;
  items: Alert[];
}

// 页面使用
const res = await alertsApi.list(params);
setAlerts(res.items);
setTotal(res.total);
```

### 3.3 类型定义

- 每个 API 模块有对应的 interface，放在 `src/api/` 对应文件里
- 不要用 `any`，实在不知道类型用 `unknown` 然后做类型收窄
- 可选字段用 `?`，不要用 `| undefined | null`

```ts
// ✅ 正确
interface Alert {
  id: number;
  message?: string;   // 可选
}

// ❌ 错误
interface Alert {
  id: number;
  message: string | undefined | null;
}
```

### 3.4 错误处理统一模式

```ts
// 页面里统一用这个模式
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const fetchData = async () => {
  setLoading(true);
  setError('');
  try {
    const res = await someApi.list();
    setData(res.items);
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : '加载失败');
  } finally {
    setLoading(false);
  }
};
```

### 3.5 表单提交

- 提交前做客户端校验，有明确错误提示
- 提交中禁用按钮（`disabled={submitting}`），避免重复提交
- 成功后调用 `onSuccess?.()` 通知父组件刷新

---

## 四、Git 规范

### 4.1 分支策略

- `dev` 分支：日常开发，合并前必须本地跑通
- `main` 分支：稳定版本，由大牛 merge
- 不要直接 push main

### 4.2 Commit 格式

```
<type>: <描述>

type:
  feat     新功能
  fix      修复 bug
  refactor 重构（不影响功能）
  chore    杂项（配置、依赖等）
  docs     文档
  test     测试

示例：
feat: 添加设备检测配置接口
fix: 修复 reports resolved 字段统计错误
```

### 4.3 每次 push 前

1. 后端：`cd backend && python -m pytest tests/ -q` 跑测试
2. 前端：`npm run build` 确认没有 TS 类型错误
3. 有 breaking change（改了接口格式）必须在 Discord 提前告知

---

## 五、常见坑（踩过的别再踩）

| 坑 | 原因 | 解决 |
|---|---|---|
| reports resolved 永远是 0 | Alert 没有 `status` 字段，要用 `is_resolved` | 查 Model 确认字段名 |
| 前端传的字段后端丢失 | Schema 没加该字段 | 新增字段同步更新 Schema |
| 并发切换模型崩溃 | 全局变量未加锁 | 用 `threading.Lock()` |
| 告警轮询拿到旧数据 | 直接 `setAlerts(data)` 而非 `data.items` | 适配 `{total,items}` 格式 |
| 时间戳时区问题 | `datetime.now()` 无时区 | 用 `datetime.now(timezone.utc)` |

---

## 六、当前技术栈版本

| 技术 | 版本 |
|---|---|
| Python | 3.10 |
| FastAPI | 0.110+ |
| SQLAlchemy | 2.x |
| Pydantic | v2 |
| React | 18 |
| TypeScript | 5.x |
| YOLOv8 | ultralytics 8.3.0 |

---

*最后更新：2026-03-05 | 维护：贺大牛*
