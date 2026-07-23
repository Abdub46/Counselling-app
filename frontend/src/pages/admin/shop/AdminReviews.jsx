import React, { useEffect, useState } from 'react';
import { Star, Check, EyeOff, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllReviews, approveReview, hideReview, deleteReview, replyToReview } from '../../../services/shopApi';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Hidden: 'bg-gray-100 text-gray-600',
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});

  const load = (status) => {
    setLoading(true);
    getAllReviews(status ? { status } : {}).then(setReviews).catch(() => toast.error('Failed to load reviews')).finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      toast.success('Review approved');
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'Approved' } : r)));
    } catch { toast.error('Action failed'); }
  };

  const handleHide = async (id) => {
    try {
      await hideReview(id);
      toast.success('Review hidden');
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'Hidden' } : r)));
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      toast.success('Review deleted');
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleReply = async (id) => {
    const reply = replyDrafts[id];
    if (!reply?.trim()) return;
    try {
      await replyToReview(id, reply);
      toast.success('Reply saved');
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, adminReply: reply } : r)));
    } catch { toast.error('Reply failed'); }
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>
          <p className="text-sm text-gray-500">{reviews.length} review(s)</p>
        </div>
        <select className="input-field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Hidden">Hidden</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.user?.fullName} on <span className="font-medium">{r.product?.name}</span></p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[r.status]}`}>{r.status}</span>
              </div>

              {r.adminReply && (
                <div className="bg-primary-50 rounded-lg p-3 text-xs text-gray-600">
                  <span className="font-semibold text-primary-700">Your reply: </span>{r.adminReply}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {r.status !== 'Approved' && (
                  <button onClick={() => handleApprove(r._id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <Check size={13} /> Approve
                  </button>
                )}
                {r.status !== 'Hidden' && (
                  <button onClick={() => handleHide(r._id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <EyeOff size={13} /> Hide
                  </button>
                )}
                <button onClick={() => handleDelete(r._id)} className="text-xs py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5">
                  <Trash2 size={13} /> Delete
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  className="input-field text-sm"
                  placeholder="Write a reply..."
                  value={replyDrafts[r._id] ?? r.adminReply ?? ''}
                  onChange={(e) => setReplyDrafts({ ...replyDrafts, [r._id]: e.target.value })}
                />
                <button onClick={() => handleReply(r._id)} className="btn-primary text-xs px-3 flex items-center gap-1.5 whitespace-nowrap">
                  <MessageSquare size={13} /> Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
