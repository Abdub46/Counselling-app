import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeNewsletter } from '../services/shopApi';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const { message } = await subscribeNewsletter(email);
      toast.success(message);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 rounded-3xl mx-4 md:mx-8 my-10 px-6 py-12 md:py-16 text-center">
      {/* Decorative soft blobs */}
      <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

      <div className="relative max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/15 mb-4">
          <Mail className="text-white" size={22} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Stay Nourished, Stay Informed</h2>
        <p className="text-primary-50 text-sm md:text-base mb-6">
          Get nutrition tips, new supplement launches, and exclusive offers delivered straight to your inbox.
        </p>

        {subscribed ? (
          <div className="flex items-center justify-center gap-2 text-white font-medium bg-white/10 rounded-full py-3 px-6 max-w-sm mx-auto">
            <CheckCircle2 size={20} /> You're subscribed — welcome aboard!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full px-5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/70"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-primary-700 font-semibold rounded-full px-6 py-3 text-sm hover:bg-primary-50 transition-colors disabled:opacity-60"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
