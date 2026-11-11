import React, { useState, useEffect } from 'react';
import {
  Bike,
  Plus,
  Search,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Edit2,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDeliveryBoys() {
  const { adminToken } = useAuth();
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State: Register New
  const [newBoy, setNewBoy] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: 'bike',
    vehicle_number: '',
    city: 'Bangalore',
    service_zone: 'Central & East Zones'
  });

  // Form State: Edit Existing
  const [editingBoy, setEditingBoy] = useState(null);

  useEffect(() => {
    fetchDeliveryBoys();
  }, [adminToken]);

  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/delivery-boys', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeliveryBoys(data.deliveryBoys || []);
      }
    } catch (err) {
      console.error('Failed to fetch delivery boys', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newBoy.name.trim() || !newBoy.phone.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/delivery-boys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newBoy)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewBoy({
          name: '',
          phone: '',
          email: '',
          vehicle_type: 'bike',
          vehicle_number: '',
          city: 'Bangalore',
          service_zone: 'Central & East Zones'
        });
        fetchDeliveryBoys();
      } else {
        alert(data.message || 'Failed to register delivery boy');
      }
    } catch (err) {
      alert('Error registering delivery boy');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (boy) => {
    setEditingBoy({
      id: boy.id,
      name: boy.name,
      phone: boy.phone,
      email: boy.email || '',
      vehicle_type: boy.vehicle_type || 'bike',
      vehicle_number: boy.vehicle_number || '',
      city: boy.city || 'Bangalore',
      service_zone: boy.service_zone || 'Central & East Zones',
      status: boy.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBoy || !editingBoy.name.trim() || !editingBoy.phone.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/delivery-boys/${editingBoy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingBoy)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setEditingBoy(null);
        fetchDeliveryBoys();
      } else {
        alert(data.message || 'Failed to update delivery boy');
      }
    } catch (err) {
      alert('Error updating delivery boy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (boy) => {
    const nextStatus = boy.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`/api/delivery-boys/${boy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchDeliveryBoys();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleDelete = async (boyId) => {
    if (!window.confirm('Are you sure you want to remove this delivery boy? Associated orders will be unassigned.')) return;
    try {
      const res = await fetch(`/api/delivery-boys/${boyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchDeliveryBoys();
      }
    } catch (err) {
      alert('Failed to remove delivery boy');
    }
  };

  const filteredBoys = deliveryBoys.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.phone.includes(searchTerm) ||
    (b.vehicle_number && b.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalBoys = deliveryBoys.length;
  const activeBoys = deliveryBoys.filter(b => b.status === 'active').length;
  const onDutyCount = deliveryBoys.filter(b => (b.active_deliveries_count || 0) > 0).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1.5">
            <Bike className="w-4 h-4" /> Logistics & Delivery Fleet
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Registered Delivery Boys
          </h1>
          <p className="text-xs text-slate-500">
            Register dispatch riders, manage temperature-controlled cold vans, edit vehicle profiles, and assign order dispatches.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register Delivery Boy
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xl">
            {totalBoys}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Fleet</div>
            <div className="text-lg font-bold text-slate-900">{totalBoys} Registered</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            {activeBoys}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Active on Duty</div>
            <div className="text-lg font-bold text-emerald-600">{activeBoys} Available</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            {onDutyCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Currently on Delivery</div>
            <div className="text-lg font-bold text-blue-600">{onDutyCount} Active Orders</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search delivery boy by name, phone, vehicle #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          {filteredBoys.length} Riders found
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Delivery Boy</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Service Zone</th>
                <th className="py-3 px-4">Active Deliveries</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Duty Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading delivery fleet...
                  </td>
                </tr>
              ) : filteredBoys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Bike className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <div className="font-bold text-slate-800 text-sm">No delivery personnel registered</div>
                    <p className="text-xs text-slate-400 mb-3">Register your first delivery rider to begin assigning orders.</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                    >
                      + Register Delivery Boy
                    </button>
                  </td>
                </tr>
              ) : (
                filteredBoys.map((boy) => (
                  <tr key={boy.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                          {boy.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{boy.name}</div>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {boy.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {boy.vehicle_type === 'van' ? <Truck className="w-3 h-3 text-blue-600" /> : <Bike className="w-3 h-3 text-emerald-600" />}
                          {boy.vehicle_type}
                        </span>
                        {boy.vehicle_number && (
                          <span className="block font-mono text-[10px] text-slate-400">
                            {boy.vehicle_number}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{boy.service_zone || 'All Zones'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{boy.city}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {boy.active_deliveries_count > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {boy.active_deliveries_count} active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Idle / Ready</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {boy.total_completed_count || 0}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(boy)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full transition ${
                          boy.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${boy.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {boy.status === 'active' ? 'Active on Duty' : 'Off Duty'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(boy)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Delivery Boy Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/${boy.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${boy.name}, greetings from Freshbunch Dispatch Desk.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="WhatsApp Rider"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(boy.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove delivery boy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Register New Delivery Boy */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">Register Delivery Boy</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Gowda"
                  value={newBoy.name}
                  onChange={(e) => setNewBoy({ ...newBoy, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 44332"
                  value={newBoy.phone}
                  onChange={(e) => setNewBoy({ ...newBoy, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="rider@freshbunch.com"
                  value={newBoy.email}
                  onChange={(e) => setNewBoy({ ...newBoy, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={newBoy.vehicle_type}
                    onChange={(e) => setNewBoy({ ...newBoy, vehicle_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="bike">Motorcycle (Bike)</option>
                    <option value="scooter">Electric Scooter</option>
                    <option value="van">Chilled Delivery Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="KA-05-MH-1234"
                    value={newBoy.vehicle_number}
                    onChange={(e) => setNewBoy({ ...newBoy, vehicle_number: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base City</label>
                  <input
                    type="text"
                    value={newBoy.city}
                    onChange={(e) => setNewBoy({ ...newBoy, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Zone</label>
                  <input
                    type="text"
                    value={newBoy.service_zone}
                    onChange={(e) => setNewBoy({ ...newBoy, service_zone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
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
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Rider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Existing Delivery Boy */}
      {isEditModalOpen && editingBoy && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">Edit Delivery Boy Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingBoy.name}
                  onChange={(e) => setEditingBoy({ ...editingBoy, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editingBoy.phone}
                  onChange={(e) => setEditingBoy({ ...editingBoy, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingBoy.email}
                  onChange={(e) => setEditingBoy({ ...editingBoy, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={editingBoy.vehicle_type}
                    onChange={(e) => setEditingBoy({ ...editingBoy, vehicle_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="bike">Motorcycle (Bike)</option>
                    <option value="scooter">Electric Scooter</option>
                    <option value="van">Chilled Delivery Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Plate</label>
                  <input
                    type="text"
                    value={editingBoy.vehicle_number}
                    onChange={(e) => setEditingBoy({ ...editingBoy, vehicle_number: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editingBoy.city}
                    onChange={(e) => setEditingBoy({ ...editingBoy, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Zone</label>
                  <input
                    type="text"
                    value={editingBoy.service_zone}
                    onChange={(e) => setEditingBoy({ ...editingBoy, service_zone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duty Status</label>
                <select
                  value={editingBoy.status}
                  onChange={(e) => setEditingBoy({ ...editingBoy, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="active">Active on Duty</option>
                  <option value="inactive">Off Duty / Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
