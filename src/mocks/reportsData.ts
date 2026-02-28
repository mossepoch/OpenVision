
export const reportsStats = {
  totalTasks: 156,
  completedTasks: 142,
  avgCompliance: 94.8,
  totalAlerts: 47,
  avgDuration: 28.5,
  complianceTrend: 2.3,
  tasksTrend: 12,
  alertsTrend: -5.2,
  durationTrend: -1.8
};

export const complianceTrendData = [
  { date: '01/09', compliance: 91.2, tasks: 18 },
  { date: '01/10', compliance: 93.5, tasks: 22 },
  { date: '01/11', compliance: 92.8, tasks: 20 },
  { date: '01/12', compliance: 95.1, tasks: 24 },
  { date: '01/13', compliance: 94.3, tasks: 19 },
  { date: '01/14', compliance: 96.2, tasks: 26 },
  { date: '01/15', compliance: 94.8, tasks: 23 }
];

export const alertDistribution = [
  { type: '步骤顺序错误', count: 14, color: '#ef4444', percent: 29.8 },
  { type: '步骤超时', count: 11, color: '#f97316', percent: 23.4 },
  { type: '未穿戴防护装备', count: 9, color: '#eab308', percent: 19.1 },
  { type: '工具未归位', count: 7, color: '#0052d9', percent: 14.9 },
  { type: '漏步骤', count: 6, color: '#8b5cf6', percent: 12.8 }
];

export const stationPerformance = [
  { station: '工位-01', compliance: 96.8, tasks: 42, alerts: 5, operator: '张伟', avgDuration: 25.3 },
  { station: '工位-02', compliance: 95.2, tasks: 38, alerts: 8, operator: '李娜', avgDuration: 27.1 },
  { station: '工位-03', compliance: 89.5, tasks: 35, alerts: 18, operator: '王强', avgDuration: 32.6 },
  { station: '工位-04', compliance: 97.1, tasks: 41, alerts: 3, operator: '刘芳', avgDuration: 24.8 },
  { station: '工位-05', compliance: 93.4, tasks: 28, alerts: 9, operator: '陈明', avgDuration: 29.4 },
  { station: '工位-06', compliance: 94.9, tasks: 32, alerts: 4, operator: '赵丽', avgDuration: 26.7 }
];

export const dailyTaskDetails = [
  {
    id: 'RPT-001',
    taskName: '装配线A - 发动机组装',
    station: '工位-01',
    operator: '张伟',
    sopName: '发动机组装 SOP v2.3',
    startTime: '08:30',
    endTime: '09:02',
    duration: 32,
    compliance: 96.5,
    steps: 8,
    completedSteps: 8,
    alerts: 0,
    status: 'completed'
  },
  {
    id: 'RPT-002',
    taskName: '装配线B - 变速箱装配',
    station: '工位-02',
    operator: '李娜',
    sopName: '变速箱装配 SOP v1.8',
    startTime: '08:45',
    endTime: '09:18',
    duration: 33,
    compliance: 98.2,
    steps: 10,
    completedSteps: 10,
    alerts: 0,
    status: 'completed'
  },
  {
    id: 'RPT-003',
    taskName: '装配线C - 底盘组装',
    station: '工位-03',
    operator: '王强',
    sopName: '底盘组装 SOP v3.1',
    startTime: '09:00',
    endTime: '09:45',
    duration: 45,
    compliance: 82.3,
    steps: 6,
    completedSteps: 6,
    alerts: 3,
    status: 'alert'
  },
  {
    id: 'RPT-004',
    taskName: '装配线D - 电气系统安装',
    station: '工位-04',
    operator: '刘芳',
    sopName: '电气系统安装 SOP v2.0',
    startTime: '09:15',
    endTime: '09:42',
    duration: 27,
    compliance: 99.1,
    steps: 7,
    completedSteps: 7,
    alerts: 0,
    status: 'completed'
  },
  {
    id: 'RPT-005',
    taskName: '装配线A - 发动机组装',
    station: '工位-01',
    operator: '张伟',
    sopName: '发动机组装 SOP v2.3',
    startTime: '09:50',
    endTime: '10:25',
    duration: 35,
    compliance: 94.8,
    steps: 8,
    completedSteps: 8,
    alerts: 1,
    status: 'completed'
  },
  {
    id: 'RPT-006',
    taskName: '装配线E - 内饰安装',
    station: '工位-05',
    operator: '陈明',
    sopName: '内饰安装 SOP v1.5',
    startTime: '09:30',
    endTime: '10:08',
    duration: 38,
    compliance: 91.7,
    steps: 9,
    completedSteps: 9,
    alerts: 2,
    status: 'completed'
  },
  {
    id: 'RPT-007',
    taskName: '装配线F - 车身焊接',
    station: '工位-06',
    operator: '赵丽',
    sopName: '车身焊接 SOP v2.6',
    startTime: '08:30',
    endTime: '09:05',
    duration: 35,
    compliance: 95.3,
    steps: 7,
    completedSteps: 7,
    alerts: 1,
    status: 'completed'
  },
  {
    id: 'RPT-008',
    taskName: '装配线B - 变速箱装配',
    station: '工位-02',
    operator: '李娜',
    sopName: '变速箱装配 SOP v1.8',
    startTime: '09:30',
    endTime: null,
    duration: 0,
    compliance: 97.5,
    steps: 10,
    completedSteps: 6,
    alerts: 0,
    status: 'running'
  }
];

export const hourlyDistribution = [
  { hour: '08:00', count: 6 },
  { hour: '09:00', count: 12 },
  { hour: '10:00', count: 18 },
  { hour: '11:00', count: 15 },
  { hour: '12:00', count: 4 },
  { hour: '13:00', count: 8 },
  { hour: '14:00', count: 16 },
  { hour: '15:00', count: 20 },
  { hour: '16:00', count: 14 },
  { hour: '17:00', count: 10 }
];
