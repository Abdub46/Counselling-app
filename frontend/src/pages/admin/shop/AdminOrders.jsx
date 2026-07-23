import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllOrders, updateOrderStatus } from '../../../services/shopApi';
import { formatKsh } from '../../../utils/format';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-700',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', status: '' });

  const load = useCallback((page = 1) => {
    setLoading(true);
    getAllOrders({ ...filters, page, limit: 20 })
      .then((data) => { setOrders(data.orders); setPagination(data.pagination); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      toast.success('Order status updated');
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-500">{pagination.total || 0} order(s)</p>
      </div>

      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by order #, name or email..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
        </div>
        <select className="input-field w-auto" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders found.</p>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{o.user?.fullName} • {o.user?.email}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800">{formatKsh(o.total)}</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <select
                  className="input-field w-auto text-xs"
                  value={o.status}
                  onChange={(e) => handleStatusChange(o._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex gap-2">
                  <Link to={`/shop/orders/${o._id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <Printer size={13} /> View / Print Invoice
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => load(pg)}
              className={`h-9 w-9 rounded-lg text-sm font-medium ${pg === pagination.page ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {pg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
