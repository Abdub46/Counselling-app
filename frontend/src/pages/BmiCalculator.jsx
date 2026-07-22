import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BmiCalculator = () => {
  const { user, refreshUser } = useAuth();
  const [weight, setWeight] = useState(user?.weight || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/bmi/calculate', { weight: Number(weight) });
      setResult({ bmi: data.bmi, category: data.category });
      toast.success('BMI calculated and saved to your history');
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-4 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">BMI Calculator</h1>
        <p className="text-sm text-gray-500">Uses your saved height ({user?.height} cm). Results are saved to your history.</p>
      </div>

      <div className="card">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="label-text">Your Weight (kg)</label>
            <input type="number" required className="input-field" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Calculating...' : 'Calculate & Save'}
          </button>
        </form>

        {result && (
          <div className="mt-5 bg-primary-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Your BMI</p>
            <p className="text-3xl font-bold text-primary-700">{result.bmi}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{result.category}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BmiCalculator;
