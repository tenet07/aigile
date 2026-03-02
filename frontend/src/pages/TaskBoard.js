import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trello } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TaskBoard = () => {
  const { workspaceId, agents } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    fetchTasks();
  }, [workspaceId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks/${workspaceId}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      await axios.post(`${API}/tasks`, { workspace_id: workspaceId, ...newTask });
      toast.success('Task created');
      setShowCreate(false);
      setNewTask({ title: '', description: '', priority: 'medium' });
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`${API}/tasks/${taskId}?status=${newStatus}`);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const columns = [
    { id: 'todo', label: 'To Do', color: 'border-secondary/30' },
    { id: 'in_progress', label: 'In Progress', color: 'border-accent/30' },
    { id: 'done', label: 'Done', color: 'border-success/30' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'low':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      default:
        return 'bg-white/5 text-muted-foreground border-white/10';
    }
  };

  return (
    <div data-testid="task-board">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" data-testid="board-title">
            Task Board
          </h1>
          <p className="text-base text-muted-foreground font-mono">Manage tasks and agent assignments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md neon-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          data-testid="create-task-btn"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          New Task
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" data-testid="create-task-modal">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Create Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono placeholder:text-white/20 transition-colors mb-4"
              data-testid="task-title-input"
            />
            <textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono placeholder:text-white/20 transition-colors mb-4 h-24 resize-none"
              data-testid="task-description-input"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full bg-black/50 border border-white/10 focus:border-secondary text-white rounded-md p-3 font-mono mb-6"
              data-testid="task-priority-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={createTask}
                className="flex-1 bg-primary hover:bg-[#6000DD] text-white font-mono uppercase tracking-wider px-6 py-3 rounded-md transition-all"
                data-testid="confirm-create-task-btn"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 bg-transparent border border-white/20 text-white hover:bg-white/5 font-mono uppercase tracking-wider px-6 py-3 rounded-md transition-all"
                data-testid="cancel-create-task-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="task-columns">
        {columns.map((column) => (
          <div key={column.id} className={`bg-[#0A0A0A] border ${column.color} rounded-xl p-4`} data-testid={`column-${column.id}`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h2 className="text-lg font-semibold tracking-tight">{column.label}</h2>
              <span className="text-xs font-mono text-muted-foreground">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks
                .filter(task => task.status === column.id)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors cursor-pointer group"
                    data-testid={`task-${task.id}`}
                  >
                    <h3 className="font-semibold text-sm mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-mono uppercase px-2 py-1 border rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.agent_assigned && (
                        <span className="text-xs font-mono px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded">
                          {task.agent_assigned}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns
                        .filter(col => col.id !== column.id)
                        .map((col) => (
                          <button
                            key={col.id}
                            onClick={() => updateTaskStatus(task.id, col.id)}
                            className="text-xs font-mono px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                            data-testid={`move-to-${col.id}-btn`}
                          >
                            → {col.label}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              {tasks.filter(t => t.status === column.id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center" data-testid={`empty-${column.id}`}>
                  <Trello className="w-8 h-8 text-muted-foreground mb-2" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground font-mono">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;