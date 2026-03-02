# OpenVision - AI 视觉监控平台

## 项目概述

**目标**: 打造开源版"百度云一见",更好用的 AI 视觉监控平台

**核心价值:**
- 摄像头 + YOLOv26 实时检测
- LLM 智能分析和告警
- 简单易用,部署方便
- 不绑定硬件,支持通用摄像头

## 技术架构

### 前端 (已有)
- React 19 + TypeScript + Vite
- TailwindCSS
- 路由: React Router
- 可视化: Recharts

### 后端 (待开发)
- **Framework**: FastAPI (Python)
- **YOLO**: YOLOv26 (Ultralytics)
- **LLM**: Claude Sonnet 4.5 / 本地 Qwen
- **数据库**: PostgreSQL + Redis
- **视频流**: RTSP/RTMP/HTTP-FLV

### 部署
- Docker Compose 一键启动
- 支持云端 + 边缘部署

## 开发计划

### Phase 1: MVP (2周) - 目标: 2026-03-16

#### Week 1 (3.2 - 3.9)
- [ ] 后端框架搭建 (FastAPI)
- [ ] YOLOv26 推理服务
- [ ] 摄像头接入 (RTSP)
- [ ] 前端-后端 API 对接
- [ ] 基础监控界面

#### Week 2 (3.9 - 3.16)  
- [ ] LLM 分析模块
- [ ] 告警规则引擎
- [ ] 邮件 + 站内信推送
- [ ] Docker 部署脚本
- [ ] 测试 + Bug 修复

### Phase 2: 模型训练 (2周) - 目标: 2026-03-30
- [ ] 数据标注工具集成
- [ ] YOLOv26 训练流程
- [ ] 模型版本管理
- [ ] 训练任务调度

### Phase 3: LLM 增强 (2周) - 目标: 2026-04-13
- [ ] 视频片段分析
- [ ] 场景理解和推理
- [ ] 自然语言查询
- [ ] 智能报警优化

### Phase 4: 优化 + 推广 (持续)
- [ ] 多路并发优化
- [ ] 边缘设备适配
- [ ] 文档完善
- [ ] 技术文章输出
- [ ] 社区运营

## 团队分工

### 贺大牛 (CTO)
- 整体架构设计
- YOLOv26 推理引擎
- LLM 分析模块
- 技术难点攻坚
- Code Review

### 贺二牛
- FastAPI 后端开发
- 摄像头接入服务
- 数据库设计
- 告警推送模块

### 贺三牛
- 前端界面开发
- 实时监控面板
- 告警展示组件
- Docker 部署脚本

## 项目目录

```
openvision/
├── frontend/          # React 前端 (已有)
├── backend/           # FastAPI 后端 (待开发)
│   ├── api/          # API 路由
│   ├── core/         # 核心服务
│   │   ├── yolo/    # YOLOv26 推理
│   │   ├── llm/     # LLM 分析
│   │   └── camera/  # 摄像头管理
│   ├── models/       # 数据模型
│   └── utils/        # 工具类
├── docker/           # Docker 配置
├── docs/             # 文档
└── scripts/          # 脚本工具
```

## 技术决策记录

### 2026-03-02
- ✅ YOLO 版本: **YOLOv26** (最新版)
- ✅ 后端框架: **FastAPI**
- ✅ Phase 1 告警: 邮件 + 站内信
- ✅ Phase 2 告警: 飞书 + 微信

## 进度追踪

- **项目启动**: 2026-03-02 ✅
- **MVP 目标**: 2026-03-16
- **当前状态**: 项目初始化中

## 相关链接

- GitHub: https://github.com/mossepoch/OpenVision
- 竞品参考: 百度云一见, 海康威视训练平台
- 开源参考: WGAI, YoloUltralyticsWeb, aiv

---

**更新时间**: 2026-03-02 22:20
**下次更新**: 每日同步进度
