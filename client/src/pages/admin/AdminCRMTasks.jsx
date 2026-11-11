import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Clock,
  AlertTriangle,
  User,
  ShoppingBag,
  Trash2,
  Calendar,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCRMTasks() {
  const { adminToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    assigned_to: 'Head Chef Marco',
    customer_name: '',
    order_number: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [adminToken]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/crm/tasks', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      // Optimistic update
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' }
            : t
        )
      );

      const res = await fetch(`http://localhost:5000/api/crm/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (!data.success) {
        fetchTasks(); // revert on failure
      }
    } catch (err) {
      console.error('Failed to toggle task', err);
      fetchTasks();
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await fetch(`http://localhost:5000/api/crm/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    } catch (err) {
      console.error('Failed to delete task', err);
      fetchTasks();
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:5000/api/crm/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewTask({
          title: '',
          priority: 'medium',
          due_date: new Date().toISOString().split('T')[0],
          assigned_to: 'Head Chef Marco',
          customer_name: '',
          order_number: ''
        });
        fetchTasks();
      }
    } catch (err) {
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && t.assigned_to !== assigneeFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(term);
      const matchCustomer = t.customer_name?.toLowerCase().includes(term);
      const matchOrder = t.order_number?.toLowerCase().includes(term);
      if (!matchTitle && !matchCustomer && !matchOrder) return false;
    }
    return true;
  });

  // Analytics counts
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const urgentCount = tasks.filter(t => t.status === 'pending' && (t.priority === 'urgent' || t.priority === 'high')).length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const priorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            CRM Operational Pipeline
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">
            Operations & Team Tasks
          </h1>
          <p className="text-xs text-slate-500">
            Track kitchen preparation, customer follow-ups, courier dispatches, and gifting reminders.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-200 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            {totalCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Tasks</div>
            <div className="text-lg font-serif font-bold text-slate-800">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            {pendingCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Pending Action</div>
            <div className="text-lg font-serif font-bold text-amber-600">{pendingCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            {urgentCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Urgent / High</div>
            <div className="text-lg font-serif font-bold text-rose-600">{urgentCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            {completedCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Completed</div>
            <div className="text-lg font-serif font-bold text-emerald-600">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
          >
            <option value="all">All Assignees</option>
            <option value="Head Chef Marco">Head Chef Marco</option>
            <option value="Baker Vikram">Baker Vikram</option>
            <option value="Rider Rahul">Rider Rahul</option>
            <option value="Sales Lead Aarti">Sales Lead Aarti</option>
            <option value="Florist Maya">Florist Maya</option>
            <option value="Bakery Team">Bakery Team</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, client, order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading operational tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            <h4 className="font-serif font-bold text-slate-700">No tasks found</h4>
            <p className="text-xs text-slate-400">All current operations are running smoothly or filter is too restrictive.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-4 flex items-start justify-between gap-4 transition hover:bg-slate-50/70 ${
                  isDone ? 'bg-slate-50/40 opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-rose-600 transition shrink-0"
                    title={isDone ? 'Mark as pending' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold text-slate-800 ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      {priorityBadge(task.priority)}
                    </div>

                    {/* Metadata chips */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-0.5 rounded-lg font-medium text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        {task.assigned_to || 'Unassigned'}
                      </span>

                      {task.due_date && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due: {task.due_date}
                        </span>
                      )}

                      {task.customer_name && (
                        <span className="flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg font-medium">
                          <User className="w-3 h-3" />
                          {task.customer_name}
                        </span>
                      )}

                      {task.order_number && (
                        <span className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg font-mono font-medium">
                          <ShoppingBag className="w-3 h-3" />
                          #{task.order_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-800 text-lg">Create New Operational Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect fondant finishing on 3-tier anniversary cake"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Head Chef Marco">Head Chef Marco (Master Pastry Chef)</option>
                  <option value="Baker Vikram">Baker Vikram (Artisan Baking)</option>
                  <option value="Florist Maya">Florist Maya (Floral Bouquets)</option>
                  <option value="Rider Rahul">Rider Rahul (Cold-Van Dispatch)</option>
                  <option value="Sales Lead Aarti">Sales Lead Aarti (VIP Accounts)</option>
                  <option value="Support Team">General Support Desk</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={newTask.customer_name}
                    onChange={(e) => setNewTask({ ...newTask, customer_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Order # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. FB-1002"
                    value={newTask.order_number}
                    onChange={(e) => setNewTask({ ...newTask, order_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-100 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add to Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
