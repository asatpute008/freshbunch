import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Gift,
  Truck,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminCRMCalendar() {
  const { adminToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, delivery, occasion
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [taskModalData, setTaskModalData] = useState(null);
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [adminToken]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/crm/calendar', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, isCurrentMonth: true, dateStr });
  }

  // Remaining padding for 35 or 42 cells
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 2 > 12 ? 1 : month + 2;
    const y = month + 2 > 12 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, isCurrentMonth: false, dateStr });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (filterType === 'all') return true;
    return ev.type === filterType;
  });

  const getEventsForDate = (dateStr) => {
    return filteredEvents.filter((ev) => ev.date === dateStr);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskModalData) return;
    setTaskSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/crm/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(taskModalData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Operational task scheduled successfully!');
        setTaskModalData(null);
      }
    } catch (err) {
      alert('Failed to schedule task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            CRM Dispatch & Occasion Calendar
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">
            {monthNames[month]} {year}
          </h1>
          <p className="text-xs text-slate-500">
            Unified timeline of customer birthdays, anniversaries, and scheduled cake & flower deliveries.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setFilterType('delivery')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                filterType === 'delivery' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Deliveries
            </button>
            <button
              onClick={() => setFilterType('occasion')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                filterType === 'occasion' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              Occasions
            </button>
          </div>

          {/* Month Steppers */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="text-rose-500">Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className="text-rose-500">Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarDays.map((cell, idx) => {
            const dayEvents = getEventsForDate(cell.dateStr);
            const isToday = cell.dateStr === todayStr;

            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 flex flex-col justify-between transition-colors ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/50 text-slate-300'
                    : isToday
                    ? 'bg-rose-50/30'
                    : 'bg-white hover:bg-slate-50/60'
                }`}
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                      isToday
                        ? 'bg-rose-600 text-white shadow-sm'
                        : cell.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] text-[11px]">
                  {dayEvents.map((ev, evIdx) => (
                    <button
                      key={evIdx}
                      onClick={() => setSelectedEvent(ev)}
                      className={`w-full text-left p-1.5 rounded-lg text-[10px] font-medium leading-tight truncate border flex items-center gap-1.5 transition ${
                        ev.type === 'delivery'
                          ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {ev.type === 'delivery' ? (
                        <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                      ) : (
                        <Gift className="w-3 h-3 text-rose-500 shrink-0" />
                      )}
                      <span className="truncate">{ev.title}</span>
                    </button>
                  ))}
                </div>

                {/* Empty placeholder */}
                {dayEvents.length === 0 && <div className="flex-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Drawer/Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    selectedEvent.type === 'delivery' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {selectedEvent.type === 'delivery' ? <Truck className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-slate-800 text-lg">
                    {selectedEvent.type === 'delivery' ? 'Delivery Dispatch' : 'Customer Occasion'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Scheduled for {selectedEvent.date}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Customer:</span>
                  <span className="font-bold text-slate-800">{selectedEvent.customer_name}</span>
                </div>
                {selectedEvent.phone && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-bold text-slate-800">{selectedEvent.phone}</span>
                  </div>
                )}
                {selectedEvent.order_number && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Order Number:</span>
                    <span className="font-mono font-bold text-rose-600">#{selectedEvent.order_number}</span>
                  </div>
                )}
                {selectedEvent.amount && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Order Amount:</span>
                    <span className="font-bold text-slate-800">₹{selectedEvent.amount}</span>
                  </div>
                )}
                {selectedEvent.status && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Status:</span>
                    <span className="font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                      {selectedEvent.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons based on event type */}
              <div className="space-y-2">
                {selectedEvent.type === 'occasion' && (
                  <>
                    <a
                      href={`https://wa.me/${selectedEvent.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Warm wishes from Freshbunch! 🌸 Dear ${selectedEvent.customer_name}, on this special ${selectedEvent.title.replace('🎉 ', '')}, treat yourself to our fresh artisanal cakes with exclusive 15% OFF coupon: CELEBRATE15 at https://freshbunch.com`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-100 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send WhatsApp Celebration Offer
                    </a>
                    <button
                      onClick={() => {
                        setTaskModalData({
                          title: `Follow up with ${selectedEvent.customer_name} for ${selectedEvent.title}`,
                          priority: 'high',
                          due_date: selectedEvent.date,
                          assigned_to: 'Sales Lead Aarti',
                          customer_name: selectedEvent.customer_name
                        });
                        setSelectedEvent(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add to CRM Tasks
                    </button>
                  </>
                )}

                {selectedEvent.type === 'delivery' && (
                  <div className="flex gap-2">
                    <a
                      href={`/admin/orders`}
                      className="flex-1 text-center py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                    >
                      Open in Order Pipeline
                    </a>
                    <button
                      onClick={() => {
                        setTaskModalData({
                          title: `Verify delivery packing for Order #${selectedEvent.order_number}`,
                          priority: 'urgent',
                          due_date: selectedEvent.date,
                          assigned_to: 'Head Chef Marco',
                          order_number: selectedEvent.order_number,
                          customer_name: selectedEvent.customer_name
                        });
                        setSelectedEvent(null);
                      }}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Assign Kitchen Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {taskModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-800 text-lg">Schedule Operational Task</h3>
              <button
                onClick={() => setTaskModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskModalData.title || ''}
                  onChange={(e) => setTaskModalData({ ...taskModalData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskModalData.priority || 'medium'}
                    onChange={(e) => setTaskModalData({ ...taskModalData, priority: e.target.value })}
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
                    value={taskModalData.due_date || ''}
                    onChange={(e) => setTaskModalData({ ...taskModalData, due_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
                <select
                  value={taskModalData.assigned_to || 'Bakery Team'}
                  onChange={(e) => setTaskModalData({ ...taskModalData, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Head Chef Marco">Head Chef Marco</option>
                  <option value="Baker Vikram">Baker Vikram</option>
                  <option value="Rider Rahul">Rider Rahul</option>
                  <option value="Sales Lead Aarti">Sales Lead Aarti</option>
                  <option value="Florist Maya">Florist Maya</option>
                  <option value="Support Team">General Support</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTaskModalData(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskSubmitting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-100 disabled:opacity-50"
                >
                  {taskSubmitting ? 'Creating...' : 'Confirm Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
