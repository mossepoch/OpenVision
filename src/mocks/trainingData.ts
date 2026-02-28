
export interface TrainingTask {
  id: string;
  name: string;
  datasetId: string;
  datasetName: string;
  baseModel: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'stopped';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  startTime: string;
  endTime?: string;
  duration: string;
  params: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    imgSize: number;
    optimizer: string;
    device: string;
  };
  metrics?: {
    mAP50: number;
    mAP5095: number;
    precision: number;
    recall: number;
    boxLoss: number;
    clsLoss: number;
  };
  logs: string[];
  lossHistory: { epoch: number; trainLoss: number; valLoss: number; mAP50: number }[];
}

export const trainingTasks: TrainingTask[] = [
  {
    id: 'task-001',
    name: '工位装配检测 v2.1 训练',
    datasetId: 'ds-001',
    datasetName: '工位装配检测数据集 v2.1',
    baseModel: 'yolov8m.pt',
    status: 'completed',
    progress: 100,
    currentEpoch: 100,
    totalEpochs: 100,
    startTime: '2025-01-12 09:15:00',
    endTime: '2025-01-12 14:32:00',
    duration: '5h 17m',
    params: {
      epochs: 100,
      batchSize: 16,
      learningRate: 0.01,
      imgSize: 640,
      optimizer: 'SGD',
      device: 'GPU 0',
    },
    metrics: {
      mAP50: 0.923,
      mAP5095: 0.741,
      precision: 0.918,
      recall: 0.897,
      boxLoss: 0.0312,
      clsLoss: 0.0187,
    },
    logs: [
      '[09:15:02] 初始化训练环境...',
      '[09:15:05] 加载数据集: 工位装配检测数据集 v2.1 (3842 张图片)',
      '[09:15:08] 加载基础模型: yolov8m.pt',
      '[09:15:12] 开始训练 - Epochs: 100, Batch: 16, LR: 0.01',
      '[09:15:15] Epoch 1/100: box_loss=0.8921, cls_loss=1.2341, mAP50=0.312',
      '[09:22:30] Epoch 10/100: box_loss=0.4523, cls_loss=0.6782, mAP50=0.621',
      '[09:45:18] Epoch 25/100: box_loss=0.2891, cls_loss=0.3421, mAP50=0.782',
      '[10:15:44] Epoch 50/100: box_loss=0.1823, cls_loss=0.2134, mAP50=0.856',
      '[11:30:22] Epoch 75/100: box_loss=0.0891, cls_loss=0.1023, mAP50=0.901',
      '[14:31:55] Epoch 100/100: box_loss=0.0312, cls_loss=0.0187, mAP50=0.923',
      '[14:32:00] 训练完成! 最佳模型已保存至 runs/train/task-001/weights/best.pt',
      '[14:32:01] 验证集 mAP50: 0.923, mAP50-95: 0.741',
    ],
    lossHistory: [
      { epoch: 1, trainLoss: 0.892, valLoss: 0.921, mAP50: 0.312 },
      { epoch: 5, trainLoss: 0.621, valLoss: 0.654, mAP50: 0.498 },
      { epoch: 10, trainLoss: 0.452, valLoss: 0.478, mAP50: 0.621 },
      { epoch: 15, trainLoss: 0.381, valLoss: 0.402, mAP50: 0.698 },
      { epoch: 20, trainLoss: 0.334, valLoss: 0.358, mAP50: 0.741 },
      { epoch: 25, trainLoss: 0.289, valLoss: 0.312, mAP50: 0.782 },
      { epoch: 30, trainLoss: 0.261, valLoss: 0.284, mAP50: 0.803 },
      { epoch: 40, trainLoss: 0.221, valLoss: 0.243, mAP50: 0.831 },
      { epoch: 50, trainLoss: 0.182, valLoss: 0.201, mAP50: 0.856 },
      { epoch: 60, trainLoss: 0.152, valLoss: 0.171, mAP50: 0.874 },
      { epoch: 70, trainLoss: 0.121, valLoss: 0.143, mAP50: 0.889 },
      { epoch: 75, trainLoss: 0.089, valLoss: 0.112, mAP50: 0.901 },
      { epoch: 80, trainLoss: 0.071, valLoss: 0.094, mAP50: 0.911 },
      { epoch: 90, trainLoss: 0.048, valLoss: 0.067, mAP50: 0.918 },
      { epoch: 100, trainLoss: 0.031, valLoss: 0.052, mAP50: 0.923 },
    ],
  },
  {
    id: 'task-002',
    name: '安全防护装备识别训练',
    datasetId: 'ds-002',
    datasetName: '安全防护装备识别数据集',
    baseModel: 'yolov8s.pt',
    status: 'running',
    progress: 63,
    currentEpoch: 63,
    totalEpochs: 100,
    startTime: '2025-01-14 10:20:00',
    duration: '2h 41m',
    params: {
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      imgSize: 640,
      optimizer: 'AdamW',
      device: 'GPU 0',
    },
    logs: [
      '[10:20:01] 初始化训练环境...',
      '[10:20:04] 加载数据集: 安全防护装备识别数据集 (2156 张图片)',
      '[10:20:07] 加载基础模型: yolov8s.pt',
      '[10:20:10] 开始训练 - Epochs: 100, Batch: 32, LR: 0.001',
      '[10:20:13] Epoch 1/100: box_loss=0.7823, cls_loss=1.1234, mAP50=0.287',
      '[10:35:22] Epoch 10/100: box_loss=0.4012, cls_loss=0.5891, mAP50=0.589',
      '[11:02:45] Epoch 25/100: box_loss=0.2634, cls_loss=0.3012, mAP50=0.734',
      '[11:45:18] Epoch 50/100: box_loss=0.1523, cls_loss=0.1834, mAP50=0.812',
      '[12:30:33] Epoch 63/100: box_loss=0.1123, cls_loss=0.1342, mAP50=0.851',
      '[13:01:05] 当前 Epoch 63/100 训练中...',
    ],
    lossHistory: [
      { epoch: 1, trainLoss: 0.782, valLoss: 0.812, mAP50: 0.287 },
      { epoch: 5, trainLoss: 0.534, valLoss: 0.561, mAP50: 0.445 },
      { epoch: 10, trainLoss: 0.401, valLoss: 0.423, mAP50: 0.589 },
      { epoch: 15, trainLoss: 0.341, valLoss: 0.362, mAP50: 0.641 },
      { epoch: 20, trainLoss: 0.298, valLoss: 0.318, mAP50: 0.692 },
      { epoch: 25, trainLoss: 0.263, valLoss: 0.281, mAP50: 0.734 },
      { epoch: 30, trainLoss: 0.234, valLoss: 0.252, mAP50: 0.762 },
      { epoch: 40, trainLoss: 0.198, valLoss: 0.214, mAP50: 0.798 },
      { epoch: 50, trainLoss: 0.152, valLoss: 0.168, mAP50: 0.812 },
      { epoch: 60, trainLoss: 0.118, valLoss: 0.134, mAP50: 0.843 },
      { epoch: 63, trainLoss: 0.112, valLoss: 0.128, mAP50: 0.851 },
    ],
  },
  {
    id: 'task-003',
    name: '底盘组装工序识别训练',
    datasetId: 'ds-003',
    datasetName: '底盘组装工序数据集',
    baseModel: 'yolov11m.pt',
    status: 'queued',
    progress: 0,
    currentEpoch: 0,
    totalEpochs: 150,
    startTime: '2025-01-14 13:05:00',
    duration: '等待中',
    params: {
      epochs: 150,
      batchSize: 16,
      learningRate: 0.005,
      imgSize: 1280,
      optimizer: 'SGD',
      device: 'GPU 0',
    },
    logs: [
      '[13:05:00] 任务已加入训练队列，等待 GPU 资源...',
      '[13:05:01] 当前队列位置: 第 1 位',
    ],
    lossHistory: [],
  },
  {
    id: 'task-004',
    name: '电气线束检测训练（失败）',
    datasetId: 'ds-004',
    datasetName: '电气线束安装数据集',
    baseModel: 'yolov8n.pt',
    status: 'failed',
    progress: 23,
    currentEpoch: 23,
    totalEpochs: 100,
    startTime: '2025-01-13 16:30:00',
    endTime: '2025-01-13 17:12:00',
    duration: '42m',
    params: {
      epochs: 100,
      batchSize: 64,
      learningRate: 0.01,
      imgSize: 640,
      optimizer: 'SGD',
      device: 'GPU 0',
    },
    logs: [
      '[16:30:01] 初始化训练环境...',
      '[16:30:04] 加载数据集: 电气线束安装数据集 (1245 张图片)',
      '[16:30:07] 加载基础模型: yolov8n.pt',
      '[16:30:10] 开始训练 - Epochs: 100, Batch: 64, LR: 0.01',
      '[16:30:13] Epoch 1/100: box_loss=0.9123, cls_loss=1.3421',
      '[16:45:22] Epoch 10/100: box_loss=0.5234, cls_loss=0.7123',
      '[17:05:18] Epoch 23/100: box_loss=0.3891, cls_loss=0.4523',
      '[17:12:33] ERROR: CUDA out of memory. Tried to allocate 2.50 GiB',
      '[17:12:33] 训练失败: GPU 显存不足，建议减小 batch size 后重试',
    ],
    lossHistory: [
      { epoch: 1, trainLoss: 0.912, valLoss: 0.943, mAP50: 0.198 },
      { epoch: 5, trainLoss: 0.678, valLoss: 0.701, mAP50: 0.312 },
      { epoch: 10, trainLoss: 0.523, valLoss: 0.548, mAP50: 0.421 },
      { epoch: 15, trainLoss: 0.445, valLoss: 0.469, mAP50: 0.498 },
      { epoch: 20, trainLoss: 0.412, valLoss: 0.438, mAP50: 0.534 },
      { epoch: 23, trainLoss: 0.389, valLoss: 0.412, mAP50: 0.556 },
    ],
  },
];

export const availableModels = [
  { id: 'yolov8n.pt', name: 'YOLOv8n', series: 'YOLOv8', size: '6.2 MB', params: '3.2M', speed: '极快' },
  { id: 'yolov8s.pt', name: 'YOLOv8s', series: 'YOLOv8', size: '21.5 MB', params: '11.2M', speed: '快' },
  { id: 'yolov8m.pt', name: 'YOLOv8m', series: 'YOLOv8', size: '49.7 MB', params: '25.9M', speed: '中等' },
  { id: 'yolov8l.pt', name: 'YOLOv8l', series: 'YOLOv8', size: '83.7 MB', params: '43.7M', speed: '较慢' },
  { id: 'yolov8x.pt', name: 'YOLOv8x', series: 'YOLOv8', size: '130.5 MB', params: '68.2M', speed: '慢' },
  { id: 'yolov11n.pt', name: 'YOLOv11n', series: 'YOLOv11', size: '5.4 MB', params: '2.6M', speed: '极快' },
  { id: 'yolov11s.pt', name: 'YOLOv11s', series: 'YOLOv11', size: '18.4 MB', params: '9.4M', speed: '快' },
  { id: 'yolov11m.pt', name: 'YOLOv11m', series: 'YOLOv11', size: '38.8 MB', params: '20.1M', speed: '中等' },
  { id: 'yolov11l.pt', name: 'YOLOv11l', series: 'YOLOv11', size: '49.0 MB', params: '25.3M', speed: '较慢' },
  { id: 'yolov11x.pt', name: 'YOLOv11x', series: 'YOLOv11', size: '109.3 MB', params: '56.9M', speed: '慢' },
];
