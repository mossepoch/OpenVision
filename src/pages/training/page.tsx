import { useState } from 'react';
import { trainingTasks, TrainingTask } from '../../mocks/trainingData';
import TaskListItem from './components/TaskListItem';
import TaskDetailPanel from './components/TaskDetailPanel';
import NewTaskForm, { NewTaskPayload } from './components/NewTaskForm';

type FilterStatus = 'all' | 'running' | 'queued' | 'completed' | 'failed';

export default function TrainingPage() {
  const [tasks, setTasks] = useState<TrainingTask[]>(trainingTasks);
  const [selectedId, setSelectedId] = useState<string>(trainingTasks[0]?.id ?? '');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const selectedTask = tasks.find(t => t.id === selectedId) ?? null;

  const filtered = tasks.filter(t => filterStatus === 'all' || t.status === filterStatus);

  const stats = {
    total: tasks.length,
    running: tasks.filter(t => t.status === 'running').length,
    queued: tasks.filter(t => t.status === 'queued').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  };

  const handleStop = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: 'stopped' as const, endTime: new Date().toLocaleString() }
          : t
      )
    );
  };

  const handleDelete = (taskId: string) => {
    setDeleteConfirm(taskId);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    setTasks(prev => prev.filter(t => t.id !== deleteConfirm));
    if (selectedId === deleteConfirm) {
      const remaining = tasks.filter(t => t.id !== deleteConfirm);
      setSelectedId(remaining[0]?.id ?? '');
    }
    setDeleteConfirm(null);
  };

  const handleNewTask = (payload: NewTaskPayload) => {
    const newTask: TrainingTask = {
      id: `task-${Date.now()}`,
      name: payload.name,
      datasetId: payload.datasetId,
      datasetName: payload.datasetName,
      baseModel: payload.baseModel,
      status: 'queued',
      progress: 0,
      currentEpoch: 0,
      totalEpochs: payload.epochs,
      startTime: new Date().toLocaleString(),
      duration: '等待中',
      params: {
        epochs: payload.epochs,
        batchSize: payload.batchSize,
        learningRate: payload.learningRate,
        imgSize: payload.imgSize,
        optimizer: payload.optimizer,
        device: 'GPU 0',
      },
      logs: [
        `[${new Date().toLocaleTimeString()}] 任务已加入训练队列，等待 GPU 资源...`,
        `[${new Date().toLocaleTimeString()}] 当前队列位置: 第 ${stats.queued + 1} 位`,
      ],
      lossHistory: [],
    };
    setTasks(prev => [newTask, ...prev]);
    setSelectedId(newTask.id);
    setShowNewForm(false);
  };

  const filterTabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: stats.total },
    { key: 'running', label: '训练中', count: stats.running },
    { key: 'queued', label: '排队中', count: stats.queued },
    { key: 'completed', label: '已完成', count: stats.completed },
    { key: 'failed', label: '失败', count: stats.failed },
  ];

  return (
    <div className="flex flex-col h-full p-5 gap-4 min-h-0">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-gray-900 mb-1">模型训练</h1>
            <p className="text-[13px] text-gray-400">
              异步训练任务管理，实时查看训练进度与结果
            </p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-[16px]"></i>
            新建训练任务
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {[
          {
            label: '任务总数',
            value: stats.total,
            icon: 'ri-list-check-2',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: '训练中',
            value: stats.running,
            icon: 'ri-loader-4-line',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: '排队中',
            value: stats.queued,
            icon: 'ri-time-line',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: '已完成',
            value: stats.completed,
            icon: 'ri-checkbox-circle-line',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: '失败',
            value: stats.failed,
            icon: 'ri-close-circle-line',
            color: 'text-red-500',
            bg: 'bg-red-50',
          },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-[18px]`}></i>
            </div>
            <div>
              <div className="text-[20px] font-semibold text-gray-900 leading-tight">{s.value}</div>
              <div className="text-[11px] text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Task List */}
        <div className="w-[300px] flex-shrink-0 flex flex-col min-h-0">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1 mb-3 flex-shrink-0">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.key
                    ? 'bg-purple-600 text-white font-medium shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 rounded-full ${
                      filterStatus === tab.key ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.length > 0 ? (
              filtered.map(task => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  isSelected={selectedId === task.id}
                  onSelect={t => setSelectedId(t.id)}
                  onStop={handleStop}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-12 h-12 flex items-center justify-center mb-3">
                  <i className="ri-cpu-line text-[36px] text-gray-200"></i>
                </div>
                <p className="text-[12px] text-gray-400">暂无训练任务</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="flex-1 min-h-0 min-w-0">
          {selectedTask ? (
            <TaskDetailPanel task={selectedTask} onStop={handleStop} onDelete={handleDelete} />
          ) : (
            <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <i className="ri-cpu-line text-[48px] text-gray-200"></i>
              </div>
              <p className="text-[13px] font-medium text-gray-500 mb-1">选择一个训练任务</p>
              <p className="text-[11px] text-gray-400">点击左侧任务查看详情</p>
            </div>
          )}
        </div>
      </div>

      {/* New Task Form Modal */}
      {showNewForm && <NewTaskForm onClose={() => setShowNewForm(false)} onSubmit={handleNewTask} />}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-[380px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <i className="ri-delete-bin-line text-red-500 text-[20px]"></i>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">确认删除任务</h3>
                <p className="text-[11px] text-gray-400">此操作不可撤销</p>
              </div>
            </div>
            <p className="text-[12px] text-gray-600 mb-5 bg-red-50 rounded-xl p-3">
              删除后，该任务的训练日志、训练曲线及结果数据将全部清除。
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-[12px] text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-[12px] text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}