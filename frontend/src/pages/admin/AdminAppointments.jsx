import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STATUS_OPTIONS = ['Pending', 'Approved', 'Completed', 'Cancelled'];
const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async (status) => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments', { params: status ? { status } : {} });
      setAppointments(data.appointments);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success('Status updated');
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointment Management</h1>
          <p className="text-sm text-gray-500">{appointments.length} appointment(s)</p>
        </div>
        <select className="input-field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-gray-500">No appointments found.</p>
        ) : (
          appointments.map((a) => (
            <div key={a._id} className="card">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{a.snapshot?.name || a.user?.fullName}</p>
                  <p className="text-xs text-gray-500">{a.snapshot?.email || a.user?.email} • {a.snapshot?.phone || a.user?.phone}</p>
                  <p className="text-sm text-gray-700 mt-2">{a.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {a.appointmentType} • {new Date(a.preferredDate).toLocaleDateString()} at {a.preferredTime}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Goal: {a.goal} — Duration: {a.problemDuration}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  <select
                    className="input-field w-auto text-xs"
                    value={a.status}
                    onChange={(e) => updateStatus(a._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
