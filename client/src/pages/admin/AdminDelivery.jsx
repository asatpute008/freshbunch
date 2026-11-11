import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, Plus, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDelivery() {
  const { adminToken } = useAuth();
  const [pincodes, setPincodes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pincode Modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [pincodeVal, setPincodeVal] = useState('');
  const [areaName, setAreaName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [charge, setCharge] = useState('49');
  const [minFree, setMinFree] = useState('599');
  const [cutoff, setCutoff] = useState('18:00');
  const [pinFeedback, setPinFeedback] = useState('');

  // Slot Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotName, setSlotName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [slotCharge, setSlotCharge] = useState('0');
  const [slotFeedback, setSlotFeedback] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pinRes, slotRes] = await Promise.all([
        fetch('/api/delivery/admin/pincodes', {
          headers: { Authorization: `Bearer ${adminToken}` }
        }),
        fetch('/api/delivery/admin/slots', {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      ]);
      const pinData = await pinRes.json();
      const slotData = await slotRes.json();

      if (pinData.success) setPincodes(pinData.pincodes);
      if (slotData.success) setSlots(slotData.slots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) loadData();
  }, [adminToken]);

  // Pincode Actions
  const openAddPin = () => {
    setEditingPin(null);
    setPincodeVal('');
    setAreaName('');
    setCity('Bengaluru');
    setCharge('49');
    setMinFree('599');
    setCutoff('18:00');
    setIsPinModalOpen(true);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinFeedback('');

    const payload = {
      pincode: pincodeVal.trim(),
      area_name: areaName.trim(),
      city: city.trim(),
      delivery_charge: Number(charge),
      min_free_delivery_amount: Number(minFree),
      same_day_cutoff_time: cutoff,
      is_active: 1
    };

    try {
      const url = editingPin
        ? `/api/delivery/admin/pincodes/${editingPin.id}`
        : '/api/delivery/admin/pincodes';
      const method = editingPin ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsPinModalOpen(false);
        loadData();
      } else {
        setPinFeedback(data.message || 'Error saving pincode');
      }
    } catch (err) {
      setPinFeedback('Network error: ' + err.message);
    }
  };

  const handleDeletePin = async (id) => {
    if (!window.confirm('Delete this delivery pincode rule?')) return;
    try {
      const res = await fetch(`/api/delivery/admin/pincodes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setPincodes(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Slot Actions
  const openAddSlot = () => {
    setEditingSlot(null);
    setSlotName('');
    setStartTime('09:00');
    setEndTime('12:00');
    setSlotCharge('0');
    setIsSlotModalOpen(true);
  };

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    setSlotFeedback('');

    const payload = {
      slot_name: slotName.trim(),
      start_time: startTime,
      end_time: endTime,
      slot_charge: Number(slotCharge) || 0,
      is_active: 1
    };

    try {
      const url = editingSlot
        ? `/api/delivery/admin/slots/${editingSlot.id}`
        : '/api/delivery/admin/slots';
      const method = editingSlot ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsSlotModalOpen(false);
        loadData();
      } else {
        setSlotFeedback(data.message || 'Error saving slot');
      }
    } catch (err) {
      setSlotFeedback('Network error: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          Delivery Logistics & Slot Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure serviceable pincodes, base charges, free delivery thresholds, and delivery windows.
        </p>
      </div>

      {/* Pincodes Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              <span>Serviceable Pincodes & Rates</span>
            </h3>
            <p className="text-[11px] text-slate-400">Postal zones where deliveries are currently accepted</p>
          </div>
          <button
            onClick={openAddPin}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Pincode
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Pincode</th>
                <th className="py-3 px-4">Area & City</th>
                <th className="py-3 px-4">Standard Fee</th>
                <th className="py-3 px-4">Free Delivery Above</th>
                <th className="py-3 px-4">Same-Day Cutoff</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pincodes.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">{p.pincode}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block">{p.area_name}</span>
                    <span className="text-[10px] text-slate-400">{p.city}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{p.delivery_charge}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">₹{p.min_free_delivery_amount}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{p.same_day_cutoff_time}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeletePin(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Remove pincode"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Slots Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-600" />
              <span>Available Delivery Time Slots</span>
            </h3>
            <p className="text-[11px] text-slate-400">Scheduled fulfillment windows and surcharges</p>
          </div>
          <button
            onClick={openAddSlot}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Delivery Slot
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slots.map(s => (
            <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{s.slot_name}</span>
                <span className="text-slate-500 font-mono text-[11px] mt-0.5 block">
                  Window: {s.start_time} - {s.end_time}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 block">
                  {s.slot_charge > 0 ? `+₹${s.slot_charge} Extra` : 'Free Slot'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pincode Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-scale">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900">Add Serviceable Pincode</h3>
              <button onClick={() => setIsPinModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {pinFeedback && <p className="text-xs text-red-500">{pinFeedback}</p>}

            <form onSubmit={handlePinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pincode (6 Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincodeVal}
                  onChange={(e) => setPincodeVal(e.target.value.replace(/\D/g, ''))}
                  placeholder="560034"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Area Name *</label>
                <input
                  type="text"
                  required
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. Koramangala 4th Block"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Charge (₹)</label>
                  <input
                    type="number"
                    value={charge}
                    onChange={(e) => setCharge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={minFree}
                    onChange={(e) => setMinFree(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Same-Day Cutoff</label>
                  <input
                    type="text"
                    value={cutoff}
                    onChange={(e) => setCutoff(e.target.value)}
                    placeholder="18:00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-rose-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold"
                >
                  Save Pincode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-scale">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900">Add Delivery Window Slot</h3>
              <button onClick={() => setIsSlotModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {slotFeedback && <p className="text-xs text-red-500">{slotFeedback}</p>}

            <form onSubmit={handleSlotSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Slot Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Celebration (06:00 PM - 09:00 PM)"
                  value={slotName}
                  onChange={(e) => setSlotName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Time (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Extra Surcharge (₹)</label>
                <input
                  type="number"
                  value={slotCharge}
                  onChange={(e) => setSlotCharge(e.target.value)}
                  placeholder="0 (or 99 for midnight)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t border-rose-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
