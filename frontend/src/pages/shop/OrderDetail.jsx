import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrderById } from '../../services/shopApi';
import { formatKsh } from '../../utils/format';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-700',
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="pt-8 text-sm text-gray-500">Loading...</p>;
  if (!order) return <p className="pt-8 text-sm text-gray-500">Order not found.</p>;

  return (
    <div className="pt-4 max-w-2xl mx-auto space-y-6 print:pt-0">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/shop/orders" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <button onClick={() => window.print()} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
          <Printer size={14} /> Print Invoice
        </button>
      </div>

      <div className="card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{order.orderNumber}</h1>
            <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-b border-gray-100 py-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Customer</p>
            <p className="text-gray-700">{order.customerInfo?.fullName}</p>
            <p className="text-gray-500">{order.customerInfo?.email}</p>
            <p className="text-gray-500">{order.customerInfo?.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Delivery Address</p>
            <p className="text-gray-700">{order.customerInfo?.deliveryAddress}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">Items</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">💊</div>
                )}
                <div className="flex-1">
                  <p className="text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-400">{formatKsh(item.price)} × {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-800">{formatKsh(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatKsh(order.subtotal)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600"><span>Discount ({order.couponCode})</span><span>-{formatKsh(order.discountAmount)}</span></div>
          )}
          <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatKsh(order.shippingFee)}</span></div>
          <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2">
            <span>Total</span><span>{formatKsh(order.total)}</span>
          </div>
          <p className="text-xs text-gray-400 pt-1">Payment Method: {order.paymentMethod}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
