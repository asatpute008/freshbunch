import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Printer,
  Bike,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Store,
  MapPin,
  Calendar,
  AlertCircle,
  LayoutGrid,
  List,
  Columns3,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ChefHat
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminOrders() {
  const { adminToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'kanban' (Default) or 'list'
  const [viewMode, setViewMode] = useState('kanban');

  // Filters
  const [statusTab, setStatusTab] = useState('all'); // for list view
  const [shopFilter, setShopFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedBoyId, setSelectedBoyId] = useState('');
  const [updating, setUpdating] = useState(false);

  // Drag and Drop state
  const [draggedOrderId, setDraggedOrderId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchShops();
    fetchDeliveryBoys();
  }, [adminToken, statusTab, shopFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/api/orders/admin?limit=150`;
      if (viewMode === 'list' && statusTab !== 'all') {
        url += `&status=${statusTab}`;
      }
      if (shopFilter !== 'all') {
        url += `&shop_id=${shopFilter}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/shops', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setShops(data.shops || []);
    } catch (err) {}
  };

  const fetchDeliveryBoys = async () => {
    try {
      const res = await fetch('/api/delivery-boys', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setDeliveryBoys(data.deliveryBoys || []);
    } catch (err) {}
  };

  const normalizeStatus = (s) => {
    if (s === 'confirmed') return 'confirm';
    if (s === 'preparing') return 'ready';
    if (s === 'out_for_delivery') return 'dispatched';
    if (s === 'delivered') return 'closed';
    return s;
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
        }
      }
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignDeliveryBoy = async (e) => {
    e.preventDefault();
    if (!assigningOrder) return;

    try {
      setUpdating(true);
      const boy = deliveryBoys.find((b) => String(b.id) === String(selectedBoyId));
      const res = await fetch(`/api/orders/admin/${assigningOrder.id}/assign-delivery`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ delivery_boy_id: selectedBoyId || null })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === assigningOrder.id
              ? {
                  ...o,
                  delivery_boy_id: selectedBoyId || null,
                  delivery_boy_name: boy ? boy.name : null,
                  db_phone: boy ? boy.phone : null,
                  db_vehicle: boy ? boy.vehicle_type : null
                }
              : o
          )
        );
        if (selectedOrder?.id === assigningOrder.id) {
          setSelectedOrder((prev) => ({
            ...prev,
            delivery_boy_id: selectedBoyId || null,
            delivery_boy_name: boy ? boy.name : null,
            db_phone: boy ? boy.phone : null,
            db_vehicle: boy ? boy.vehicle_type : null
          }));
        }
        setIsAssignModalOpen(false);
        setAssigningOrder(null);
      }
    } catch (err) {
      alert('Failed to assign delivery boy');
    } finally {
      setUpdating(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('text/plain', orderId);
    setDraggedOrderId(orderId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e) => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const orderIdStr = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (!orderIdStr) return;
    const orderId = Number(orderIdStr);

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (normalizeStatus(order.order_status) !== targetStatus) {
      handleUpdateStatus(orderId, targetStatus);
    }
    setDraggedOrderId(null);
  };

  // Kanban Stage Definitions
  const kanbanColumns = [
    {
      id: 'new',
      title: '1. New Orders',
      subtitle: 'Just placed by customer',
      color: 'amber',
      bgHeader: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
      dropActive: 'border-amber-400 bg-amber-50/50',
      nextLabel: 'Accept & Confirm',
      nextStatus: 'confirm'
    },
    {
      id: 'confirm',
      title: '2. Confirmed by Shop',
      subtitle: 'Accepted for baking / floral curation',
      color: 'blue',
      bgHeader: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      dropActive: 'border-blue-400 bg-blue-50/50',
      nextLabel: 'Send to Kitchen',
      nextStatus: 'ready'
    },
    {
      id: 'ready',
      title: '3. Ready in Kitchen',
      subtitle: 'Baked, packed & awaiting rider',
      color: 'purple',
      bgHeader: 'bg-purple-50 text-purple-800 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800',
      dropActive: 'border-purple-400 bg-purple-50/50',
      nextLabel: 'Dispatch to Rider',
      nextStatus: 'dispatched'
    },
    {
      id: 'dispatched',
      title: '4. Out for Delivery',
      subtitle: 'On vehicle with delivery boy',
      color: 'orange',
      bgHeader: 'bg-orange-50 text-orange-800 border-orange-200',
      badgeColor: 'bg-orange-100 text-orange-800',
      dropActive: 'border-orange-400 bg-orange-50/50',
      nextLabel: 'Mark Delivered',
      nextStatus: 'closed'
    },
    {
      id: 'closed',
      title: '5. Closed & Delivered',
      subtitle: 'Completed celebrations',
      color: 'emerald',
      bgHeader: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      dropActive: 'border-emerald-400 bg-emerald-50/50',
      nextLabel: null,
      nextStatus: null
    }
  ];

  const getStatusBadge = (status) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'new':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">New Order</span>;
      case 'confirm':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case 'ready':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Ready in Kitchen</span>;
      case 'dispatched':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Dispatched</span>;
      case 'closed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.order_number.toLowerCase().includes(search.toLowerCase()) ||
      ord.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      ord.delivery_city.toLowerCase().includes(search.toLowerCase()) ||
      (ord.delivery_boy_name && ord.delivery_boy_name.toLowerCase().includes(search.toLowerCase())) ||
      (ord.items && ord.items.some((i) => i.product_name_snapshot?.toLowerCase().includes(search.toLowerCase())));

    const matchesShop = shopFilter === 'all' || String(ord.shop_id) === String(shopFilter);

    if (viewMode === 'list' && statusTab !== 'all') {
      const matchesStatus = normalizeStatus(ord.order_status) === statusTab;
      return matchesSearch && matchesShop && matchesStatus;
    }

    return matchesSearch && matchesShop;
  });

  const cancelledOrders = orders.filter((o) => normalizeStatus(o.order_status) === 'cancelled');

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" /> Order Fulfillment Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Order Pipeline & Dispatch Board
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Visual drag-and-drop Kanban workflow from kitchen preparation to rider doorstep dispatch.
          </p>
        </div>

        {/* View Switcher: Kanban vs List */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-4 h-4 text-rose-500" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4 text-slate-500" />
              <span>List View</span>
            </button>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition shadow-xs"
            title="Refresh order board"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Shop Selector */}
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-slate-500" />
            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="all">All Shops & Outlets</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-slate-700 font-bold bg-slate-100 px-3.5 py-2 rounded-xl">
            {filteredOrders.length} Orders displayed
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order #, customer, item, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800"
          />
        </div>
      </div>

      {/* 3A. KANBAN BOARD VIEW (Primary & Default) */}
      {viewMode === 'kanban' && (
        <div className="space-y-6">
          {/* Kanban Columns Horizontal Container - Never Squishes Columns Below 270px */}
          <div className="flex gap-4 overflow-x-auto pb-6 items-start min-w-full">
            {kanbanColumns.map((col) => {
              const colOrders = filteredOrders.filter(
                (o) => normalizeStatus(o.order_status) === col.id
              );
              const isDragTarget = dragOverCol === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`min-w-[270px] flex-1 bg-slate-100/70 rounded-2xl border transition-all duration-200 flex flex-col min-h-[580px] ${
                    isDragTarget
                      ? `${col.dropActive} ring-2 ring-rose-400 shadow-md`
                      : 'border-slate-200/80 shadow-xs'
                  }`}
                >
                  {/* Column Header */}
                  <div className={`p-4 border-b rounded-t-2xl flex items-center justify-between ${col.bgHeader}`}>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5 text-slate-900">
                        {col.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-tight mt-0.5 font-medium">{col.subtitle}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${col.badgeColor}`}>
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Orders Cards Stack */}
                  <div className="p-3 pr-2.5 flex-1 space-y-3.5 overflow-y-auto max-h-[72vh]">
                    {loading ? (
                      <div className="py-12 text-center text-sm text-slate-400">Loading orders...</div>
                    ) : colOrders.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl m-1">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                        <span className="text-sm font-bold text-slate-600 block">No orders here</span>
                        <span className="text-xs text-slate-400 mt-0.5 block">Drag cards to this stage</span>
                      </div>
                    ) : (
                      colOrders.map((ord) => {
                        const assignedBoyName = ord.delivery_boy_name || ord.db_name;
                        const assignedBoyPhone = ord.db_phone;

                        return (
                          <div
                            key={ord.id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, ord.id)}
                            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-grab active:cursor-grabbing space-y-3 group"
                          >
                            {/* Card Top: Order Number & Payment Status */}
                            <div className="flex items-center justify-between gap-2">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="font-mono font-bold text-rose-600 hover:text-rose-700 hover:underline text-xs sm:text-sm whitespace-nowrap truncate block"
                                title={`Order #${ord.order_number}`}
                              >
                                #{ord.order_number}
                              </button>
                              <span
                                className={`shrink-0 text-xs font-bold uppercase px-2 py-0.5 rounded-md ${
                                  ord.payment_status === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {ord.payment_method === 'cod' ? 'COD' : 'Paid'}
                              </span>
                            </div>

                            {/* Origin Shop / Outlet Badge */}
                            {ord.shop_name && (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                <Store className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="truncate">{ord.shop_name}</span>
                              </div>
                            )}

                            {/* Customer & Slot */}
                            <div className="space-y-1 text-xs">
                              <div className="font-bold text-slate-900 text-sm truncate">
                                {ord.customer_name}
                              </div>
                              <div className="text-xs text-slate-600 truncate flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{ord.delivery_city} ({ord.delivery_pincode})</span>
                              </div>
                              <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{ord.delivery_slot}</span>
                              </div>
                            </div>

                            {/* Ordered Items Preview */}
                            <div className="pt-2 border-t border-slate-100 space-y-1">
                              {ord.items?.slice(0, 2).map((it, idx) => (
                                <div key={idx} className="text-xs text-slate-800 truncate">
                                  <strong className="font-bold text-slate-900">{it.quantity}x</strong> {it.product_name_snapshot}
                                  {it.customization?.cake_message && (
                                    <div className="text-xs text-rose-700 italic truncate pl-1 mt-0.5 bg-rose-50/70 p-1 rounded font-medium">
                                      "{it.customization.cake_message}"
                                    </div>
                                  )}
                                </div>
                              ))}
                              {ord.items && ord.items.length > 2 && (
                                <span className="text-xs text-slate-500 font-semibold block">
                                  +{ord.items.length - 2} more items...
                                </span>
                              )}
                            </div>

                            {/* Delivery Boy Rider Section */}
                            <div className="pt-2 border-t border-slate-100">
                              {assignedBoyName ? (
                                <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
                                    <Bike className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span className="truncate">{assignedBoyName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => {
                                        setAssigningOrder(ord);
                                        setSelectedBoyId(ord.delivery_boy_id || '');
                                        setIsAssignModalOpen(true);
                                      }}
                                      className="text-slate-500 hover:text-slate-900 underline text-xs font-semibold"
                                    >
                                      Change
                                    </button>
                                    {assignedBoyPhone && (
                                      <a
                                        href={`https://wa.me/${assignedBoyPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                          `Order #${ord.order_number} assigned to you. Destination: ${ord.delivery_address}, ${ord.delivery_city}. Time: ${ord.delivery_slot}. Total: ₹${ord.total_amount}.`
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-600 hover:text-emerald-700"
                                        title="WhatsApp Rider"
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAssigningOrder(ord);
                                    setSelectedBoyId('');
                                    setIsAssignModalOpen(true);
                                  }}
                                  className="w-full py-2 text-center bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-rose-100"
                                >
                                  <Bike className="w-3.5 h-3.5" />
                                  <span>+ Assign Delivery Boy</span>
                                </button>
                              )}
                            </div>

                            {/* Card Footer: Total Amount & Details */}
                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block leading-tight">Total</span>
                                <span className="font-bold text-slate-900 text-base">
                                  ₹{ord.total_amount}
                                </span>
                              </div>

                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition flex items-center gap-1.5"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Details</span>
                              </button>
                            </div>

                            {/* Full-width 1-Click Action Stepper Button */}
                            {col.nextStatus ? (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, col.nextStatus)}
                                disabled={updating}
                                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                                title={col.nextLabel}
                              >
                                <span>{col.nextLabel}</span>
                                <ChevronRight className="w-4 h-4 shrink-0" />
                              </button>
                            ) : (
                              <div className="w-full py-2 text-center bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Completed</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cancelled Orders Notice Bar */}
          {cancelledOrders.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-4 h-4" />
                <span className="font-bold">{cancelledOrders.length} Cancelled Orders on record</span>
                <span className="text-slate-500 text-xs hidden sm:inline">(Excluded from active pipeline)</span>
              </div>
              <button
                onClick={() => {
                  setViewMode('list');
                  setStatusTab('cancelled');
                }}
                className="font-bold text-slate-700 hover:text-slate-900 underline text-xs"
              >
                View Cancelled Orders in List →
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3B. TABULAR LIST VIEW (Alternative View Mode) */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Status Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1.5 text-sm font-bold">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'new', label: '1. New' },
              { id: 'confirm', label: '2. Confirm' },
              { id: 'ready', label: '3. Ready' },
              { id: 'dispatched', label: '4. Dispatched' },
              { id: 'closed', label: '5. Closed' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`px-4 py-2 rounded-xl transition ${
                  statusTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-5">Order Details</th>
                    <th className="py-4 px-5">Customer & Delivery</th>
                    <th className="py-4 px-5">Items Summary</th>
                    <th className="py-4 px-5">Total Amount</th>
                    <th className="py-4 px-5">Delivery Boy</th>
                    <th className="py-4 px-5">Current Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">Loading orders...</td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <div className="font-bold text-slate-800 text-base">No orders found</div>
                        <p className="text-sm text-slate-400">No customer orders matching this status filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const assignedBoyName = ord.delivery_boy_name || ord.db_name;
                      const assignedBoyPhone = ord.db_phone;

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-5">
                            <div className="space-y-1">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="font-mono font-bold text-rose-600 hover:text-rose-700 hover:underline block text-left text-sm"
                              >
                                #{ord.order_number}
                              </button>
                              <span className="text-xs text-slate-400 block">
                                {ord.created_at?.slice(0, 10) || 'Today'}
                              </span>
                              {ord.shop_name && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                  <Store className="w-3 h-3 text-slate-400" />
                                  {ord.shop_name}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900 text-sm">{ord.customer_name}</div>
                            <div className="text-xs text-slate-600">{ord.delivery_city} ({ord.delivery_pincode})</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {ord.delivery_slot}
                            </div>
                          </td>

                          <td className="py-4 px-5 max-w-xs">
                            <div className="space-y-1">
                              {ord.items && ord.items.map((it, idx) => (
                                <div key={idx} className="truncate text-xs text-slate-700">
                                  <strong className="text-slate-900 font-bold">{it.quantity}x</strong> {it.product_name_snapshot}
                                  {it.customization?.cake_message && (
                                    <span className="block text-xs text-rose-600 italic">
                                      "{it.customization.cake_message}"
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <span className="font-bold text-slate-900 text-base">₹{ord.total_amount}</span>
                            <span className={`block text-xs font-bold uppercase mt-0.5 ${ord.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {ord.payment_status}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            {assignedBoyName ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                                  <Bike className="w-3.5 h-3.5 text-blue-600" />
                                  {assignedBoyName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setAssigningOrder(ord);
                                      setSelectedBoyId(ord.delivery_boy_id || '');
                                      setIsAssignModalOpen(true);
                                    }}
                                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 underline"
                                  >
                                    Change
                                  </button>
                                  {assignedBoyPhone && (
                                    <a
                                      href={`https://wa.me/${assignedBoyPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                        `Order #${ord.order_number} assigned to you. Destination: ${ord.delivery_address}, ${ord.delivery_city}. Time: ${ord.delivery_slot}. Total: ₹${ord.total_amount}.`
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-600 hover:text-emerald-700"
                                      title="WhatsApp Order to Rider"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssigningOrder(ord);
                                  setSelectedBoyId('');
                                  setIsAssignModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition border border-rose-100"
                              >
                                <Bike className="w-3.5 h-3.5" /> Assign Rider
                              </button>
                            )}
                          </td>

                          <td className="py-4 px-5">
                            {getStatusBadge(ord.order_status)}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
                              title="View full order details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Assign Delivery Boy */}
      {isAssignModalOpen && assigningOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-900 text-lg">Assign Delivery Boy</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignDeliveryBoy} className="py-4 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm">
                <span className="text-slate-400 block text-xs">Order:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">#{assigningOrder.order_number}</span>
                <span className="block text-slate-600 mt-1 text-xs">To: {assigningOrder.delivery_city} ({assigningOrder.delivery_slot})</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Registered Delivery Boy
                </label>
                <select
                  value={selectedBoyId}
                  onChange={(e) => setSelectedBoyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {deliveryBoys.map((boy) => (
                    <option key={boy.id} value={boy.id}>
                      {boy.name} ({boy.vehicle_type?.toUpperCase()} - {boy.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                  {updating ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Order Details Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-xl tracking-tight">
                  Order #{selectedOrder.order_number}
                </h3>
                <span className="text-xs text-slate-500">Placed on {selectedOrder.created_at}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Status Selector Bar */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Change Order Status</label>
                <div className="flex flex-wrap gap-2">
                  {['new', 'confirm', 'ready', 'dispatched', 'closed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                        normalizeStatus(selectedOrder.order_status) === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Delivery Address:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedOrder.delivery_address}, {selectedOrder.delivery_city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Slot & Date:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.delivery_date} ({selectedOrder.delivery_slot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assigned Delivery Boy:</span>
                  <span className="font-bold text-blue-600">{selectedOrder.delivery_boy_name || selectedOrder.db_name || 'Unassigned'}</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Ordered Items</h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-sm">
                      <div>
                        <div className="font-bold text-slate-900">{it.quantity}x {it.product_name_snapshot}</div>
                        {it.customization?.cake_message && (
                          <div className="text-xs text-rose-700 italic font-medium mt-0.5">Piped: "{it.customization.cake_message}"</div>
                        )}
                        {it.customization?.weight && (
                          <div className="text-xs text-slate-400 mt-0.5">Size/Weight: {it.customization.weight}</div>
                        )}
                      </div>
                      <div className="font-bold text-slate-900">₹{it.line_total}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100">
                <span className="text-slate-800">Total Amount</span>
                <span className="text-rose-600 font-bold">₹{selectedOrder.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
