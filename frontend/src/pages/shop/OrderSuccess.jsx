import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { formatKsh } from '../../utils/format';

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  if (!order) {
    return (
      <div className="pt-10 text-center">
        <p className="text-gray-500 mb-4">No order details found.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary">Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="pt-10 max-w-lg mx-auto text-center space-y-6">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-50 text-primary-600 mx-auto">
        <CheckCircle2 size={32} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Order Placed Successfully!</h1>
        <p className="text-sm text-gray-500">
          Thank you — your order <span className="font-medium text-gray-700">{order.orderNumber}</span> has been received.
        </p>
      </div>

      <div className="card text-left space-y-2">
        {order.items.map((item) => (
          <div key={item.product} className="flex justify-between text-sm text-gray-600">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatKsh(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
          <span>Total</span>
          <span>{formatKsh(order.total)}</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
        <Link to="/shop/orders" className="btn-primary">View My Orders</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
