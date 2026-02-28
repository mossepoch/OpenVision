# OpenVision

OpenVision 是一个面向工业/安防/零售等场景的视觉智能平台前端项目，涵盖摄像头接入、实时监控、数据标注、模型训练、告警与报表等全链路模块，提供现代化的控制台与门户体验。
<img width="1920" height="934" alt="image" src="https://github.com/user-attachments/assets/2bf6801a-ff60-49d9-ad66-3fb83bfd7d06" />

## 关键特性

- 多协议摄像头接入（RTSP / ONVIF / HTTP-FLV / GB28181）
- 实时目标检测与识别（人员/车辆/物品/行为）
- 智能告警与事件管理（多渠道推送）
- 数据标注与模型训练工作流
- 云边协同推理与设备管理
- 报表中心与合规分析

## 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS
- React Router
- i18next 国际化
- Recharts 数据可视化

## 快速开始

```bash
npm install
npm run dev
```

默认启动地址：`http://localhost:3000`

## 常用脚本

- `npm run dev`：启动本地开发
- `npm run build`：生产构建（输出到 `out/`）
- `npm run preview`：本地预览生产构建
- `npm run lint`：ESLint 校验
- `npm run type-check`：TypeScript 类型检查

## 目录结构

```
src/
  components/feature/   # 侧边栏、顶部栏等基础组件
  pages/                # 业务页面
    dashboard/          # 运营看板
    monitoring/         # 实时监控
    devices/            # 设备管理
    datasets/           # 数据集
    annotation/         # 数据标注
    training/           # 训练任务
    models/             # 模型管理
    reports/            # 报表中心
    stations/           # 站点管理
    sop-config/         # SOP 配置
    login/              # 登录页
    home/               # 门户首页
  mocks/                # 演示用模拟数据
  router/               # 路由配置
  i18n/                 # 国际化
```

## 环境变量

项目支持以下可选环境变量：

- `BASE_PATH`：部署子路径（默认 `/`）
- `IS_PREVIEW`：预览模式标记
- `PROJECT_ID` / `VERSION_ID` / `READDY_AI_DOMAIN`：用于集成外部平台/服务的配置

示例：

```bash
BASE_PATH=/openvision IS_PREVIEW=1 npm run build
```

## 许可证

本项目基于 Apache License 2.0 开源，详见 `LICENSE`。
