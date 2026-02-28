export const sopTemplates = [
  {
    id: 'template-001',
    name: '发动机组装标准流程',
    category: '装配',
    steps: 8,
    avgDuration: '45分钟',
    description: '适用于四缸发动机的标准组装流程',
    usage: 156
  },
  {
    id: 'template-002',
    name: '变速箱装配流程',
    category: '装配',
    steps: 10,
    avgDuration: '60分钟',
    description: '手动变速箱装配标准操作流程',
    usage: 98
  },
  {
    id: 'template-003',
    name: '底盘组装流程',
    category: '装配',
    steps: 6,
    avgDuration: '35分钟',
    description: '车辆底盘系统组装标准流程',
    usage: 124
  },
  {
    id: 'template-004',
    name: '电气系统安装',
    category: '装配',
    steps: 7,
    avgDuration: '40分钟',
    description: '车辆电气系统安装与测试流程',
    usage: 87
  },
  {
    id: 'template-005',
    name: '质量检验流程',
    category: '质检',
    steps: 5,
    avgDuration: '20分钟',
    description: '成品质量检验标准流程',
    usage: 203
  },
  {
    id: 'template-006',
    name: '安全检查流程',
    category: '安全',
    steps: 4,
    avgDuration: '15分钟',
    description: '作业前安全检查标准流程',
    usage: 312
  }
];

export const sopList = [
  {
    id: 'sop-001',
    name: '发动机组装 SOP v2.3',
    status: 'active',
    mode: 'vl_only',
    steps: 8,
    stations: ['工位-01', '工位-05'],
    createdBy: '张工',
    createdAt: '2025-01-10',
    lastModified: '2025-01-14',
    compliance: 94.5
  },
  {
    id: 'sop-002',
    name: '变速箱装配 SOP v1.8',
    status: 'active',
    mode: 'cv_vl',
    steps: 10,
    stations: ['工位-02'],
    createdBy: '李工',
    createdAt: '2025-01-08',
    lastModified: '2025-01-13',
    compliance: 98.2
  },
  {
    id: 'sop-003',
    name: '底盘组装 SOP v3.1',
    status: 'active',
    mode: 'vl_only',
    steps: 6,
    stations: ['工位-03', '工位-06'],
    createdBy: '王工',
    createdAt: '2025-01-05',
    lastModified: '2025-01-12',
    compliance: 87.3
  },
  {
    id: 'sop-004',
    name: '电气系统安装 SOP v2.0',
    status: 'active',
    mode: 'cv_vl',
    steps: 7,
    stations: ['工位-04'],
    createdBy: '刘工',
    createdAt: '2025-01-12',
    lastModified: '2025-01-15',
    compliance: 96.8
  },
  {
    id: 'sop-005',
    name: '质量检验 SOP v1.5',
    status: 'draft',
    mode: 'vl_only',
    steps: 5,
    stations: [],
    createdBy: '赵工',
    createdAt: '2025-01-14',
    lastModified: '2025-01-14',
    compliance: 0
  }
];

export const stepTypes = [
  { id: 'assembly', name: '组装步骤', icon: 'ri-tools-line', color: 'blue' },
  { id: 'inspection', name: '检查步骤', icon: 'ri-search-eye-line', color: 'green' },
  { id: 'testing', name: '测试步骤', icon: 'ri-test-tube-line', color: 'purple' },
  { id: 'safety', name: '安全检查', icon: 'ri-shield-check-line', color: 'red' },
  { id: 'quality', name: '质量确认', icon: 'ri-checkbox-circle-line', color: 'orange' },
  { id: 'documentation', name: '记录步骤', icon: 'ri-file-text-line', color: 'gray' }
];

export const sampleSopSteps = [
  {
    id: 'step-001',
    order: 1,
    type: 'safety',
    name: '安全检查',
    description: '检查操作员是否佩戴安全手套、护目镜等防护装备',
    timeout: 60,
    required: true,
    prompt: '请确认操作员是否正确佩戴了所有必需的个人防护装备（PPE），包括安全手套、护目镜和工作服。'
  },
  {
    id: 'step-002',
    order: 2,
    type: 'assembly',
    name: '准备工具和零件',
    description: '从工具架取出所需工具，从料架取出对应零件',
    timeout: 120,
    required: true,
    prompt: '请确认操作员已从指定位置取出所有必需的工具和零件，并放置在工作台上。'
  },
  {
    id: 'step-003',
    order: 3,
    type: 'assembly',
    name: '安装气缸盖',
    description: '将气缸盖对准定位销，按照对角线顺序拧紧螺栓',
    timeout: 300,
    required: true,
    prompt: '请确认气缸盖已正确对准定位销，螺栓按照对角线顺序拧紧，扭矩符合规范。'
  },
  {
    id: 'step-004',
    order: 4,
    type: 'inspection',
    name: '检查螺栓扭矩',
    description: '使用扭矩扳手检查所有螺栓是否达到规定扭矩值',
    timeout: 180,
    required: true,
    prompt: '请确认操作员使用扭矩扳手检查了所有螺栓，扭矩值在规定范围内。'
  },
  {
    id: 'step-005',
    order: 5,
    type: 'assembly',
    name: '安装凸轮轴',
    description: '涂抹润滑油后安装凸轮轴，确保轴承座正确就位',
    timeout: 240,
    required: true,
    prompt: '请确认凸轮轴已涂抹润滑油，正确安装到位，轴承座无异常。'
  },
  {
    id: 'step-006',
    order: 6,
    type: 'testing',
    name: '旋转测试',
    description: '手动旋转曲轴，检查是否有卡滞现象',
    timeout: 120,
    required: true,
    prompt: '请确认操作员手动旋转了曲轴，旋转顺畅无卡滞。'
  },
  {
    id: 'step-007',
    order: 7,
    type: 'quality',
    name: '质量确认',
    description: '对照检查清单确认所有步骤完成且符合质量标准',
    timeout: 180,
    required: true,
    prompt: '请确认操作员对照检查清单完成了所有项目的确认，无遗漏。'
  },
  {
    id: 'step-008',
    order: 8,
    type: 'documentation',
    name: '记录与归档',
    description: '扫描二维码记录完成信息，工具归位',
    timeout: 90,
    required: true,
    prompt: '请确认操作员已扫描二维码记录信息，所有工具已归位。'
  }
];