
export const YOLO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
  'toothbrush',
  'helmet', 'glove', 'wrench', 'bolt', 'tool_box', 'engine_part', 'cable',
  'safety_vest', 'goggles', 'boots'
];

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'helmet', color: '#ef4444' },
  { id: 'cat-2', name: 'glove', color: '#f97316' },
  { id: 'cat-3', name: 'wrench', color: '#eab308' },
  { id: 'cat-4', name: 'bolt', color: '#22c55e' },
  { id: 'cat-5', name: 'tool_box', color: '#06b6d4' },
  { id: 'cat-6', name: 'engine_part', color: '#8b5cf6' },
];

export const MOCK_ANNOTATION_IMAGES = [
  {
    id: 'img-001',
    name: 'frame_0001.jpg',
    url: 'https://readdy.ai/api/search-image?query=industrial%20assembly%20line%20worker%20wearing%20safety%20gloves%20helmet%20working%20on%20engine%20parts%2C%20top%20view%20camera%2C%20factory%20floor%2C%20professional%20industrial%20photography%2C%20clean%20background&width=800&height=600&seq=ann001&orientation=landscape',
    width: 800,
    height: 600,
    annotationCount: 3,
    status: 'labeled',
  },
  {
    id: 'img-002',
    name: 'frame_0002.jpg',
    url: 'https://readdy.ai/api/search-image?query=close%20up%20mechanical%20tools%20wrench%20bolt%20on%20assembly%20workbench%2C%20industrial%20factory%20setting%2C%20overhead%20camera%20view%2C%20clean%20workshop%20environment&width=800&height=600&seq=ann002&orientation=landscape',
    width: 800,
    height: 600,
    annotationCount: 2,
    status: 'labeled',
  },
  {
    id: 'img-003',
    name: 'frame_0003.jpg',
    url: 'https://readdy.ai/api/search-image?query=factory%20worker%20hands%20assembling%20engine%20components%2C%20industrial%20production%20line%2C%20safety%20equipment%20visible%2C%20professional%20manufacturing%20photography&width=800&height=600&seq=ann003&orientation=landscape',
    width: 800,
    height: 600,
    annotationCount: 0,
    status: 'unlabeled',
  },
  {
    id: 'img-004',
    name: 'frame_0004.jpg',
    url: 'https://readdy.ai/api/search-image?query=automotive%20engine%20assembly%20station%20worker%20using%20tools%20industrial%20camera%20surveillance%20view%20manufacturing%20plant%20bright%20lighting&width=800&height=600&seq=ann004&orientation=landscape',
    width: 800,
    height: 600,
    annotationCount: 4,
    status: 'labeled',
  },
  {
    id: 'img-005',
    name: 'frame_0005.jpg',
    url: 'https://readdy.ai/api/search-image?query=factory%20worker%20wearing%20yellow%20safety%20helmet%20hard%20hat%20industrial%20workplace%20safety%20equipment%20compliance%20check%20professional%20photography&width=800&height=600&seq=ann005&orientation=landscape',
    width: 800,
    height: 600,
    annotationCount: 1,
    status: 'labeled',
  },
  {
    id: 'img-006',
    name: 'frame_0006.jpg',
    url: 'https://readdy.ai/api/search-image?query=industrial%20safety%20gloves%20protective%20equipment%20close%20up%20manufacturing%20plant%20worker%20hands%20safety%20compliance%20monitoring&width=800&height=600&seq=ann006&orientation=landscape',
    width: 800,
    height: 600,
    annotationCount: 0,
    status: 'unlabeled',
  },
  {
    id: 'img-007',
    name: 'frame_0007.jpg',
    url: 'https://readdy.ai/api/search-image?query=car%20chassis%20assembly%20line%20suspension%20system%20installation%20automotive%20manufacturing%20plant%20industrial%20robot%20arm%20professional%20factory%20photography&width=800&height=600&seq=ann007&orientation=landscape',
    width: 800,
    height: 600,
    annotationCount: 5,
    status: 'labeled',
  },
  {
    id: 'img-008',
    name: 'frame_0008.jpg',
    url: 'https://readdy.ai/api/search-image?query=automotive%20wire%20harness%20electrical%20wiring%20installation%20car%20manufacturing%20assembly%20line%20colorful%20cables%20connectors%20industrial%20photography&width=800&height=600&seq=ann008&orientation=landscape',
    width: 800,
    height: 600,
    annotationCount: 0,
    status: 'unlabeled',
  },
];

export const MOCK_ANNOTATIONS: Record<string, Array<{
  id: string;
  categoryId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}>> = {
  'img-001': [
    { id: 'ann-1', categoryId: 'cat-1', x: 0.12, y: 0.08, width: 0.18, height: 0.22 },
    { id: 'ann-2', categoryId: 'cat-2', x: 0.45, y: 0.55, width: 0.14, height: 0.18 },
    { id: 'ann-3', categoryId: 'cat-3', x: 0.68, y: 0.35, width: 0.12, height: 0.15 },
  ],
  'img-002': [
    { id: 'ann-4', categoryId: 'cat-3', x: 0.20, y: 0.30, width: 0.25, height: 0.20 },
    { id: 'ann-5', categoryId: 'cat-4', x: 0.60, y: 0.50, width: 0.10, height: 0.12 },
  ],
  'img-004': [
    { id: 'ann-6', categoryId: 'cat-1', x: 0.10, y: 0.05, width: 0.20, height: 0.25 },
    { id: 'ann-7', categoryId: 'cat-2', x: 0.35, y: 0.60, width: 0.15, height: 0.20 },
    { id: 'ann-8', categoryId: 'cat-5', x: 0.65, y: 0.40, width: 0.22, height: 0.18 },
    { id: 'ann-9', categoryId: 'cat-6', x: 0.50, y: 0.20, width: 0.18, height: 0.22 },
  ],
  'img-005': [
    { id: 'ann-10', categoryId: 'cat-1', x: 0.30, y: 0.10, width: 0.22, height: 0.28 },
  ],
  'img-007': [
    { id: 'ann-11', categoryId: 'cat-4', x: 0.15, y: 0.20, width: 0.12, height: 0.10 },
    { id: 'ann-12', categoryId: 'cat-4', x: 0.40, y: 0.35, width: 0.12, height: 0.10 },
    { id: 'ann-13', categoryId: 'cat-6', x: 0.60, y: 0.15, width: 0.25, height: 0.30 },
    { id: 'ann-14', categoryId: 'cat-3', x: 0.25, y: 0.60, width: 0.18, height: 0.14 },
    { id: 'ann-15', categoryId: 'cat-5', x: 0.70, y: 0.55, width: 0.20, height: 0.25 },
  ],
};
