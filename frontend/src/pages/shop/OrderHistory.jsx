import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyOrders } from '../../services/shopApi';
import { useCart } from '../../context/CartContext';
import { formatKsh } from '../../utils/format';
import EmptyState from '../../components/shop/EmptyState';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-700',
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addToCart({ _id: item.product, name: item.name, thumbnail: item.thumbnail, finalPrice: item.price }, item.quantity);
    });
    toast.success('Items added to cart');
    navigate('/shop/cart');
  };

  if (loading) return <p className="pt-8 text-sm text-gray-500">Loading orders...</p>;

  return (
    <div className="pt-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" message="Your order history will appear here once you make a purchase." actionLabel="Go to Shop" onAction={() => navigate('/shop')} />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                {order.items.slice(0, 4).map((item, i) => (
                  item.thumbnail ? (
                    <img key={i} src={item.thumbnail} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div key={i} className="h-14 w-14 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">💊</div>
                  )
                ))}
                {order.items.length > 4 && (
                  <div className="h-14 w-14 rounded-lg bg-gray-50 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800">{formatKsh(order.total)}</p>
                <div className="flex gap-2">
                  <Link to={`/shop/orders/${order._id}`} className="btn-secondary text-sm py-1.5 px-3">View Details</Link>
                  <button onClick={() => handleReorder(order)} className="btn-primary text-sm py-1.5 px-3">Reorder</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
