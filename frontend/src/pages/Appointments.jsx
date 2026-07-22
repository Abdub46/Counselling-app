import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    reason: '',
    problemDuration: '',
    currentManagement: '',
    goal: '',
    appointmentType: 'Online',
    preferredDate: '',
    preferredTime: '',
  });

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments/my');
      setAppointments(data.appointments);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/appointments', form);
      toast.success('Appointment booked successfully');
      setForm({
        reason: '', problemDuration: '', currentManagement: '', goal: '',
        appointmentType: 'Online', preferredDate: '', preferredTime: '',
      });
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Book an Appointment</h1>
        <p className="text-sm text-gray-500">Schedule a session with a nutrition counsellor</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Your Information (auto-filled)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><p className="text-xs text-gray-500">Name</p><p className="font-medium">{user.fullName}</p></div>
          <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{user.email}</p></div>
          <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{user.phone}</p></div>
          <div><p className="text-xs text-gray-500">Sex</p><p className="font-medium">{user.sex}</p></div>
          <div><p className="text-xs text-gray-500">Age</p><p className="font-medium">{user.age}</p></div>
          <div><p className="text-xs text-gray-500">Height</p><p className="font-medium">{user.height} cm</p></div>
          <div><p className="text-xs text-gray-500">Weight</p><p className="font-medium">{user.weight} kg</p></div>
          <div><p className="text-xs text-gray-500">Current BMI</p><p className="font-medium">{user.bmi}</p></div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Appointment Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Reason for Appointment</label>
            <textarea required className="input-field" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div>
            <label className="label-text">How long have you had this nutrition problem?</label>
            <input required className="input-field" value={form.problemDuration} onChange={(e) => setForm({ ...form, problemDuration: e.target.value })} />
          </div>
          <div>
            <label className="label-text">What have you been doing to manage it?</label>
            <textarea required className="input-field" value={form.currentManagement} onChange={(e) => setForm({ ...form, currentManagement: e.target.value })} />
          </div>
          <div>
            <label className="label-text">What is your goal from this appointment?</label>
            <textarea required className="input-field" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Appointment Type</label>
              <select className="input-field" value={form.appointmentType} onChange={(e) => setForm({ ...form, appointmentType: e.target.value })}>
                <option value="Online">Online</option>
                <option value="Physical">Physical</option>
              </select>
            </div>
            <div>
              <label className="label-text">Preferred Date</label>
              <input type="date" required min={new Date().toISOString().split('T')[0]} className="input-field" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Preferred Time</label>
              <input type="time" required className="input-field" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Your Appointments</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-gray-500">You have no appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a._id} className="border border-gray-100 rounded-lg p-3 flex justify-between items-start gap-3">
                <div>
                  <p className="font-medium text-sm text-gray-800">{a.reason}</p>
                  <p className="text-xs text-gray-500">
                    {a.appointmentType} • {new Date(a.preferredDate).toLocaleDateString()} at {a.preferredTime}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
