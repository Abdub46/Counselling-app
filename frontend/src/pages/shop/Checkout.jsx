import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/shopApi';
import { formatKsh } from '../../utils/format';

const SHIPPING_FEE = 300;

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    deliveryAddress: '',
    orderNotes: '',
    paymentMethod: 'Cash on Delivery',
  });
  const [couponCode] = useState(location.state?.couponCode || '');
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="pt-4 text-center py-16">
        <p className="text-gray-500 mb-4">Your cart is empty — add some products before checking out.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary">Go to Shop</button>
      </div>
    );
  }

  const total = subtotal + SHIPPING_FEE; // final discount recalculated server-side too

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.email || !form.deliveryAddress) {
      toast.error('Please fill in all required fields');
      return;
    }
    setPlacing(true);
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerInfo: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          deliveryAddress: form.deliveryAddress,
          orderNotes: form.orderNotes,
        },
        couponCode,
        paymentMethod: form.paymentMethod,
      });
      clearCart();
      navigate('/shop/order-success', { state: { order } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Customer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Full Name</label>
              <input required className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Phone Number</label>
              <input required className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Email</label>
              <input required type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Delivery Address</label>
              <textarea required className="input-field" rows={2} value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Order Notes (optional)</label>
              <textarea className="input-field" rows={2} value={form.orderNotes} onChange={(e) => setForm({ ...form, orderNotes: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label-text">Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              {['Cash on Delivery', 'M-Pesa', 'Card'].map((method) => (
                <label
                  key={method}
                  className={`border rounded-lg px-3 py-2.5 text-sm text-center cursor-pointer transition-colors ${
                    form.paymentMethod === method ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={form.paymentMethod === method}
                    onChange={() => setForm({ ...form, paymentMethod: method })}
                  />
                  {method}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              M-Pesa and Card payments are placeholders for now — orders are recorded and confirmed manually until a payment gateway is integrated.
            </p>
          </div>

          <button type="submit" disabled={placing} className="btn-primary w-full">
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        {/* Order summary */}
        <div className="card h-fit space-y-3">
          <h2 className="font-semibold text-gray-800">Order Summary</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 text-sm">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded bg-primary-50 flex items-center justify-center flex-shrink-0">💊</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-800">{formatKsh(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatKsh(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatKsh(SHIPPING_FEE)}</span></div>
            {couponCode && <div className="flex justify-between text-green-600"><span>Coupon</span><span>{couponCode}</span></div>}
            <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2">
              <span>Total</span><span>{formatKsh(total)}</span>
            </div>
            <p className="text-[11px] text-gray-400 pt-1">Final total (including any coupon discount) is confirmed after checkout.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
