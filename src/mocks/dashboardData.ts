export const runningTasks = [
  {
    id: 'task-001',
    name: '装配线A - 发动机组装',
    station: '工位-01',
    status: 'running',
    compliance: 94.5,
    currentStep: '步骤 3/8: 安装气缸盖',
    startTime: '2025-01-15 08:30:00',
    operator: '张伟'
  },
  {
    id: 'task-002',
    name: '装配线B - 变速箱装配',
    station: '工位-02',
    status: 'running',
    compliance: 98.2,
    currentStep: '步骤 5/10: 安装齿轮组',
    startTime: '2025-01-15 08:45:00',
    operator: '李娜'
  },
  {
    id: 'task-003',
    name: '装配线C - 底盘组装',
    station: '工位-03',
    status: 'warning',
    compliance: 87.3,
    currentStep: '步骤 2/6: 安装悬挂系统',
    startTime: '2025-01-15 09:00:00',
    operator: '王强'
  },
  {
    id: 'task-004',
    name: '装配线D - 电气系统安装',
    station: '工位-04',
    status: 'running',
    compliance: 96.8,
    currentStep: '步骤 4/7: 连接线束',
    startTime: '2025-01-15 09:15:00',
    operator: '刘芳'
  }
];

export const recentAlerts = [
  {
    id: 'alert-001',
    type: 'error',
    level: 'high',
    title: '步骤顺序错误',
    description: '工位-03 操作员跳过了步骤1,直接执行步骤2',
    station: '工位-03',
    time: '2025-01-15 10:23:15',
    status: 'pending',
    sopName: '底盘组装 SOP'
  },
  {
    id: 'alert-002',
    type: 'warning',
    level: 'medium',
    title: '步骤超时',
    description: '工位-01 步骤2执行时间超过预设阈值30秒',
    station: '工位-01',
    time: '2025-01-15 10:18:42',
    status: 'confirmed',
    sopName: '发动机组装 SOP'
  },
  {
    id: 'alert-003',
    type: 'warning',
    level: 'medium',
    title: '未穿戴防护装备',
    description: '工位-02 检测到操作员未佩戴安全手套',
    station: '工位-02',
    time: '2025-01-15 10:05:28',
    status: 'resolved',
    sopName: '变速箱装配 SOP'
  },
  {
    id: 'alert-004',
    type: 'info',
    level: 'low',
    title: '工具未归位',
    description: '工位-04 步骤完成后工具未放回指定位置',
    station: '工位-04',
    time: '2025-01-15 09:52:11',
    status: 'resolved',
    sopName: '电气系统安装 SOP'
  },
  {
    id: 'alert-005',
    type: 'error',
    level: 'high',
    title: '漏步骤',
    description: '工位-03 未执行质量检查步骤',
    station: '工位-03',
    time: '2025-01-15 09:38:56',
    status: 'pending',
    sopName: '底盘组装 SOP'
  }
];

export const deviceStatus = [
  {
    id: 'device-001',
    name: '摄像头-01',
    station: '工位-01',
    status: 'online',
    mode: 'vl_only',
    lastUpdate: '2025-01-15 10:25:30',
    fps: 30,
    analysisRate: 0.05
  },
  {
    id: 'device-002',
    name: '摄像头-02',
    station: '工位-02',
    status: 'online',
    mode: 'cv_vl',
    lastUpdate: '2025-01-15 10:25:28',
    fps: 30,
    analysisRate: 0.1
  },
  {
    id: 'device-003',
    name: '摄像头-03',
    station: '工位-03',
    status: 'warning',
    mode: 'vl_only',
    lastUpdate: '2025-01-15 10:20:15',
    fps: 25,
    analysisRate: 0.03
  },
  {
    id: 'device-004',
    name: '摄像头-04',
    station: '工位-04',
    status: 'online',
    mode: 'cv_vl',
    lastUpdate: '2025-01-15 10:25:29',
    fps: 30,
    analysisRate: 0.08
  }
];

export const statsData = {
  totalTasks: 24,
  runningTasks: 4,
  completedToday: 18,
  avgCompliance: 94.2,
  totalAlerts: 47,
  pendingAlerts: 8,
  resolvedAlerts: 39,
  devicesOnline: 12,
  devicesTotal: 15
};

export const dashboardData = {
  stats: {
    runningTasks: 4,
    avgCompliance: 94.2,
    pendingAlerts: 8,
    onlineDevices: 12,
    totalDevices: 15
  },
  runningTasks: [
    {
      id: 'task-001',
      name: '装配线A - 发动机组装',
      station: '工位-01',
      status: '运行中',
      compliance: 94.5,
      currentStep: '步骤 3/8: 安装气缸盖',
      progress: 37,
      startTime: '2025-01-15 08:30:00',
      operator: '张伟'
    },
    {
      id: 'task-002',
      name: '装配线B - 变速箱装配',
      station: '工位-02',
      status: '运行中',
      compliance: 98.2,
      currentStep: '步骤 5/10: 安装齿轮组',
      progress: 50,
      startTime: '2025-01-15 08:45:00',
      operator: '李娜'
    },
    {
      id: 'task-003',
      name: '装配线C - 底盘组装',
      station: '工位-03',
      status: '运行中',
      compliance: 87.3,
      currentStep: '步骤 2/6: 安装悬挂系统',
      progress: 33,
      startTime: '2025-01-15 09:00:00',
      operator: '王强'
    },
    {
      id: 'task-004',
      name: '装配线D - 电气系统安装',
      station: '工位-04',
      status: '运行中',
      compliance: 96.8,
      currentStep: '步骤 4/7: 连接线束',
      progress: 57,
      startTime: '2025-01-15 09:15:00',
      operator: '刘芳'
    }
  ],
  recentAlerts: [
    {
      id: 'alert-001',
      type: 'error',
      severity: 'high',
      title: '步骤顺序错误',
      description: '工位-03 操作员跳过了步骤1，直接执行步骤2',
      station: '工位-03',
      time: '10:23:15',
      status: 'pending',
      sopName: '底盘组装 SOP'
    },
    {
      id: 'alert-002',
      type: 'warning',
      severity: 'medium',
      title: '步骤超时',
      description: '工位-01 步骤2执行时间超过预设阈值30秒',
      station: '工位-01',
      time: '10:18:42',
      status: 'confirmed',
      sopName: '发动机组装 SOP'
    },
    {
      id: 'alert-003',
      type: 'warning',
      severity: 'medium',
      title: '未穿戴防护装备',
      description: '工位-02 检测到操作员未佩戴安全手套',
      station: '工位-02',
      time: '10:05:28',
      status: 'resolved',
      sopName: '变速箱装配 SOP'
    },
    {
      id: 'alert-004',
      type: 'info',
      severity: 'low',
      title: '工具未归位',
      description: '工位-04 步骤完成后工具未放回指定位置',
      station: '工位-04',
      time: '09:52:11',
      status: 'resolved',
      sopName: '电气系统安装 SOP'
    },
    {
      id: 'alert-005',
      type: 'error',
      severity: 'high',
      title: '漏步骤',
      description: '工位-03 未执行质量检查步骤',
      station: '工位-03',
      time: '09:38:56',
      status: 'pending',
      sopName: '底盘组装 SOP'
    }
  ]
};