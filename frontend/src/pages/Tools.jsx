import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const TOOL_OPTIONS = [
  { value: 'bmi', label: 'BMI Calculator (temporary)' },
  { value: 'water', label: 'Daily Water Intake Calculator' },
  { value: 'calorie', label: 'Daily Calorie Requirement Calculator' },
];

const Tools = () => {
  const [tool, setTool] = useState('bmi');

  return (
    <div className="pt-4 space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tools</h1>
        <p className="text-sm text-gray-500">Quick calculators — results here are not saved to your profile</p>
      </div>

      <div className="card">
        <label className="label-text">Select a Tool</label>
        <select className="input-field" value={tool} onChange={(e) => setTool(e.target.value)}>
          {TOOL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {tool === 'bmi' && <BmiToolCard />}
      {tool === 'water' && <WaterToolCard />}
      {tool === 'calorie' && <CalorieToolCard />}
    </div>
  );
};

const BmiToolCard = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/bmi/tools-calculate', { height: Number(height), weight: Number(weight) });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={calculate} className="space-y-4">
        <div>
          <label className="label-text">Height (cm)</label>
          <input type="number" required className="input-field" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div>
          <label className="label-text">Weight (kg)</label>
          <input type="number" required className="input-field" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Calculating...' : 'Calculate BMI'}</button>
      </form>
      {result && (
        <div className="mt-4 bg-primary-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary-700">{result.bmi}</p>
          <p className="text-sm font-medium text-gray-700">{result.category}</p>
        </div>
      )}
    </div>
  );
};

const WaterToolCard = () => {
  const [weight, setWeight] = useState('');
  const [active, setActive] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/tools/water-intake', { weight: Number(weight), physicalActivity: active });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={calculate} className="space-y-4">
        <div>
          <label className="label-text">Weight (kg)</label>
          <input type="number" required className="input-field" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> I am physically active
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Calculating...' : 'Calculate Water Intake'}</button>
      </form>
      {result && (
        <div className="mt-4 bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-accent-600">{result.litersPerDay} L</p>
          <p className="text-sm font-medium text-gray-700">≈ {result.glasses250ml} glasses (250ml) per day</p>
        </div>
      )}
    </div>
  );
};

const CalorieToolCard = () => {
  const [form, setForm] = useState({ weight: '', height: '', age: '', sex: 'Male', activityLevel: 'sedentary' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/tools/calorie-requirement', {
        ...form,
        weight: Number(form.weight),
        height: Number(form.height),
        age: Number(form.age),
      });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={calculate} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-text">Weight (kg)</label>
            <input type="number" required className="input-field" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Height (cm)</label>
            <input type="number" required className="input-field" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Age</label>
            <input type="number" required className="input-field" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Sex</label>
            <select className="input-field" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label-text">Activity Level</label>
          <select className="input-field" value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}>
            <option value="sedentary">Sedentary (little/no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very Active (physical job/training)</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Calculating...' : 'Calculate Calorie Needs'}</button>
      </form>
      {result && (
        <div className="mt-4 bg-primary-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary-700">{result.dailyCalorieRequirement} kcal/day</p>
          <p className="text-sm font-medium text-gray-700">Base metabolic rate: {result.bmr} kcal</p>
        </div>
      )}
    </div>
  );
};

export default Tools;
