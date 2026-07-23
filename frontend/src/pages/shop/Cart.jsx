import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { formatKsh } from '../../utils/format';
import { validateCoupon } from '../../services/shopApi';
import EmptyState from '../../components/shop/EmptyState';

const SHIPPING_FEE = 300; // matches backend flat rate; shown here as an estimate before checkout

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [coupon, setCoupon] = useState(null);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const { discountAmount, code } = await validateCoupon(couponCode.trim(), subtotal);
      setCoupon({ code, discountAmount });
      toast.success(`Coupon "${code}" applied`);
    } catch (err) {
      setCoupon(null);
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Browse our shop to find nutritional supplements that fit your goals."
          actionLabel="Continue Shopping"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  const discountAmount = coupon?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount) + SHIPPING_FEE;

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear Cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="card flex items-center gap-4">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.name} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">💊</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.name}</p>
                <p className="text-sm text-primary-700 font-semibold">{formatKsh(item.price)}</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 text-gray-500 hover:bg-gray-50">
                  <Minus size={13} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 text-gray-500 hover:bg-gray-50">
                  <Plus size={13} />
                </button>
              </div>
              <p className="w-20 text-right font-semibold text-gray-800 text-sm hidden sm:block">
                {formatKsh(item.price * item.quantity)}
              </p>
              <button onClick={() => removeFromCart(item.productId)} className="p-2 text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <Link to="/shop" className="inline-block text-sm text-primary-600 hover:underline pt-2">
            ← Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="card h-fit space-y-4">
          <h2 className="font-semibold text-gray-800">Order Summary</h2>

          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-9"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>
            <button type="submit" disabled={applying} className="btn-secondary whitespace-nowrap">
              {applying ? '...' : 'Apply'}
            </button>
          </form>

          <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatKsh(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({coupon.code})</span>
                <span>-{formatKsh(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span>{formatKsh(SHIPPING_FEE)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>{formatKsh(total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/shop/checkout', { state: { couponCode: coupon?.code || '' } })}
            className="btn-primary w-full"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
