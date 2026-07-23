import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, AlertTriangle, XCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { getShopDashboard } from '../../../services/shopApi';
import { formatKsh, timeAgo } from '../../../utils/format';

const AdminShopDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShopDashboard()
      .then(setData)
      .catch(() => toast.error('Failed to load shop dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="pt-8 text-sm text-gray-500">Loading dashboard...</p>;
  if (!data) return null;

  const stats = [
    { label: 'Total Products', value: data.totalProducts, icon: Package, color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, color: 'text-accent-500 bg-blue-50' },
    { label: 'Revenue', value: formatKsh(data.revenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Low Stock', value: data.lowStockCount, icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Out of Stock', value: data.outOfStockCount, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Shop Management</h1>
        <p className="text-sm text-gray-500">Overview of your supplement store</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Latest Orders</h2>
            <Link to="/admin/shop/orders" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {data.latestOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {data.latestOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-700">{o.orderNumber}</p>
                    <p className="text-xs text-gray-400">{o.user?.fullName} • {timeAgo(o.createdAt)}</p>
                  </div>
                  <p className="font-semibold text-gray-800">{formatKsh(o.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best selling products */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Best Selling Products</h2>
            <Link to="/admin/shop/products" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {data.bestSellers.length === 0 ? (
            <p className="text-sm text-gray-500">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {data.bestSellers.map((p) => (
                <div key={p._id} className="flex items-center gap-3 text-sm">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">💊</div>
                  )}
                  <div className="flex-1">
                    <p className="text-gray-700 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.salesCount} sold</p>
                  </div>
                  <p className="font-semibold text-gray-800">{formatKsh(p.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent reviews */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Recent Reviews</h2>
          <Link to="/admin/shop/reviews" className="text-xs text-primary-600 hover:underline">Manage reviews</Link>
        </div>
        {data.recentReviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recentReviews.map((r) => (
              <div key={r._id} className="flex items-start justify-between text-sm border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-gray-600 line-clamp-1">{r.comment}</p>
                  <p className="text-xs text-gray-400">{r.user?.fullName} on {r.product?.name}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 flex-shrink-0">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShopDashboard;
