# OpenVision 后端测试

## 安装测试依赖

```bash
pip install -r requirements-test.txt
```

## 运行测试

### 运行所有测试

```bash
cd backend
python3 -m pytest
```

### 运行特定测试文件

```bash
# 告警规则测试
python3 -m pytest tests/test_alert_rules.py -v

# 摄像头 API 测试
python3 -m pytest tests/test_stream_api.py -v

# YOLO 检测 API 测试
python3 -m pytest tests/test_detection_api.py -v
```

### 运行特定测试类/函数

```bash
# 运行 Person 告警规则测试
python3 -m pytest tests/test_alert_rules.py::TestAlertRulesPerson -v

# 运行单个测试
python3 -m pytest tests/test_alert_rules.py::TestAlertRulesPerson::test_person_above_threshold -v
```

### 生成覆盖率报告

```bash
python3 -m pytest --cov=app --cov-report=html
# 打开 htmlcov/index.html 查看报告
```

## 测试文件结构

```
tests/
├── conftest.py           # pytest fixtures 配置
├── test_alert_rules.py   # 告警规则单元测试 (24 个测试)
├── test_stream_api.py    # 摄像头流 API 测试 (15 个测试)
└── test_detection_api.py # YOLO 检测 API 测试 (待完善)
```

## 测试分类

### 单元测试 (Unit Tests)
- `test_alert_rules.py` - 告警规则逻辑测试
- 特点：快速、独立、无需外部依赖

### API 测试 (Integration Tests)
- `test_stream_api.py` - 摄像头流 API 测试
- `test_detection_api.py` - YOLO 检测 API 测试
- 特点：需要 FastAPI TestClient，使用测试数据库

### E2E 测试 (待添加)
- 使用 Playwright 测试前端功能
- 特点：模拟真实用户操作，运行较慢

## 编写新测试

1. 在 `tests/` 目录下创建 `test_xxx.py` 文件
2. 创建测试类 `TestXxx`
3. 编写测试函数 `test_xxx_scenario`
4. 使用 fixtures 获取测试客户端和数据库会话

示例：
```python
def test_example(client, test_device):
    response = client.get(f"/api/v1/stream/{test_device.id}/status")
    assert response.status_code == 200
```

---
_最后更新：2026-03-05_
