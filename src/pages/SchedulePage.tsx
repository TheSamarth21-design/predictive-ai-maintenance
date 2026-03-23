import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Cpu, Download } from 'lucide-react';
import { SCHEDULE_TASKS, type ScheduleTask } from '@/lib/syncplant-data';

const PRIORITY_COLORS: Record<string, string> = {
  P1: 'status-critical',
  P2: 'status-warning',
  P3: 'status-running',
  P4: 'bg-secondary text-muted-foreground border border-border',
};

export default function SchedulePage() {
  const [tasks, setTasks] = useState(SCHEDULE_TASKS);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const pending = tasks.filter(t => t.status !== 'Completed');
  const completed = tasks.filter(t => t.status === 'Completed');
  const filtered = filterPriority === 'ALL' ? pending : pending.filter(t => t.priority === filterPriority);

  const exportSchedule = () => {
    const headers = 'ID,Machine,Task,Priority,Due Date,Est. Time,Status\n';
    const rows = tasks.map(t => `${t.id},${t.machine},"${t.task}",${t.priority},${t.dueDate},${t.estimatedTime},${t.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'syncplant-schedule.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const renderTask = (task: ScheduleTask) => (
    <motion.div
      key={task.id}
      layout
      className="card-industrial hover:border-foreground/10 transition-all"
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
      >
        <div className="flex items-center gap-3">
          <span className={`status-badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
          <div>
            <p className="text-sm font-medium text-foreground">{task.task}</p>
            <p className="text-xs text-muted-foreground font-mono">{task.machine} · Due: {task.dueDate} · Est: {task.estimatedTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-badge ${task.status === 'In Progress' ? 'bg-ai/20 text-ai border border-ai/30' : task.status === 'Completed' ? 'status-running' : 'bg-secondary text-muted-foreground border border-border'}`}>
            {task.status}
          </span>
          {expandedTask === task.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </div>

      {expandedTask === task.id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-border"
        >
          <div className="flex items-start gap-2">
            <Cpu size={14} className="text-ai mt-0.5 shrink-0" />
            <div>
              <p className="data-label mb-1">AI Reasoning</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{task.aiReasoning}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // Gantt chart bars
  const ganttStart = new Date('2025-01-16');
  const ganttEnd = new Date('2025-03-15');
  const totalDays = (ganttEnd.getTime() - ganttStart.getTime()) / (1000 * 60 * 60 * 24);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Maintenance Scheduler</h2>
          <p className="text-muted-foreground text-sm">AI-optimized task scheduling and prioritization</p>
        </div>
        <button onClick={exportSchedule} className="btn-primary flex items-center gap-2">
          <Download size={14} /> Export Schedule
        </button>
      </header>

      {/* Gantt Chart */}
      <div className="card-industrial p-4 overflow-x-auto">
        <h3 className="section-title mb-3">Timeline View</h3>
        <div className="min-w-[600px]">
          {/* Month headers */}
          <div className="flex border-b border-border pb-1 mb-2">
            {['Jan', 'Feb', 'Mar'].map((m, i) => (
              <div key={m} className="flex-1 data-label text-center">{m} 2025</div>
            ))}
          </div>
          {/* Bars */}
          {tasks.filter(t => t.status !== 'Completed').map(task => {
            const due = new Date(task.dueDate);
            const daysFromStart = Math.max(0, (due.getTime() - ganttStart.getTime()) / (1000 * 60 * 60 * 24));
            const barWidth = Math.max(3, parseInt(task.estimatedTime) * 2);
            const leftPercent = (daysFromStart / totalDays) * 100;

            return (
              <div key={task.id} className="flex items-center gap-3 py-1.5">
                <span className="text-[10px] font-mono text-muted-foreground w-20 shrink-0">{task.machine}</span>
                <div className="flex-1 relative h-5 bg-secondary/30 rounded">
                  <div
                    className={`absolute h-full rounded text-[9px] flex items-center px-2 font-mono text-primary-foreground ${
                      task.priority === 'P1' ? 'bg-danger' : task.priority === 'P2' ? 'bg-caution' : 'bg-ai'
                    }`}
                    style={{ left: `${leftPercent}%`, width: `${barWidth}%`, maxWidth: `${100 - leftPercent}%` }}
                  >
                    {task.priority}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'P1', 'P2', 'P3', 'P4'].map(p => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`text-[10px] px-3 py-1.5 rounded font-mono font-bold transition-colors ${
              filterPriority === p ? 'bg-ai/20 text-ai border border-ai/30' : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.map(renderTask)}
      </div>

      {/* Completed */}
      <div>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Completed Tasks ({completed.length})
        </button>
        {showCompleted && (
          <div className="space-y-2 opacity-60">
            {completed.map(renderTask)}
          </div>
        )}
      </div>
    </div>
  );
}
