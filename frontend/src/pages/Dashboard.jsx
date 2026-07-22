import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyRes, analysisRes] = await Promise.all([
        api.get('/bmi/history'),
        api.get('/bmi/analysis'),
      ]);
      setHistory(
        historyRes.data.records.map((r) => ({
          date: new Date(r.recordedAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
          bmi: r.bmi,
          weight: r.weight,
        }))
      );
      setAnalysis(analysisRes.data.analysis);
    } catch (err) {
      toast.error('Failed to load BMI data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newWeight) {
      toast.error('Please enter your current weight');
      return;
    }
    setUpdating(true);
    try {
      await api.post('/bmi/update', {
        weight: Number(newWeight),
        ...(newHeight ? { height: Number(newHeight) } : {}),
      });
      toast.success('Weight updated successfully');
      setNewWeight('');
      setNewHeight('');
      await Promise.all([loadData(), refreshUser()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.fullName.split(' ')[0]}!</h1>
        <p className="text-sm text-gray-500">Here's your nutrition and health summary</p>
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500">Current Height</p>
          <p className="text-xl font-bold text-gray-800">{user.height} cm</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Current Weight</p>
          <p className="text-xl font-bold text-gray-800">{user.weight} kg</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Current BMI</p>
          <p className="text-xl font-bold text-gray-800">{user.bmi}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">BMI Category</p>
          <p className="text-xl font-bold text-primary-700">{getBmiCategory(user.bmi)}</p>
        </div>
      </div>

      {/* Update weight form */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Update Your Weight</h2>
        <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="label-text">New Weight (kg)</label>
            <input type="number" className="input-field" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
          </div>
          <div className="flex-1 w-full">
            <label className="label-text">New Height (cm) — optional</label>
            <input type="number" className="input-field" placeholder={String(user.height)} value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
          </div>
          <button type="submit" disabled={updating} className="btn-primary whitespace-nowrap">
            {updating ? 'Saving...' : 'Save Update'}
          </button>
        </form>
      </div>

      {/* BMI Trend Graph */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">BMI Trend</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading chart...</p>
        ) : history.length < 2 ? (
          <p className="text-sm text-gray-500">Log at least two weight entries to see your trend graph.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="bmi" stroke="#16a34e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Auto analysis */}
      {analysis && (
        <div className="card bg-primary-50 border-primary-100">
          <h2 className="font-semibold text-primary-800 mb-2">Your Nutrition Insight</h2>
          <p className="text-sm text-gray-700 mb-1">{analysis.progress}</p>
          <p className="text-sm text-gray-700 mb-1">{analysis.weightTrend}</p>
          <p className="text-sm text-gray-700 mb-1">{analysis.interpretation}</p>
          <p className="text-sm text-gray-800 font-medium mt-2">{analysis.recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
