import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const FREQUENCY_OPTIONS = [
  'Once per week',
  'Twice per week',
  'Three times per week',
  'Almost every day',
  'Every day',
];
const MEALS_OPTIONS = ['One', 'Two', 'Three', 'Four', 'Five'];

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  dateOfBirth: '',
  sex: '',
  occupation: '',
  county: '',
  residenceTown: '',
  height: '',
  weight: '',
  hasCurrentMedicalCondition: false,
  currentMedicalConditionDetails: '',
  hasFamilyMedicalHistory: false,
  familyMedicalHistoryDetails: '',
  balancedDietFrequency: '',
  fruitVegFrequency: '',
  fastFoodFrequency: '',
  mealsPerDay: '',
  physicalActivity: false,
  drugUse: false,
  drugUseDetails: '',
};

const STEP_TITLES = [
  'Personal Information',
  'Body Measurements',
  'Medical History',
  'Dietary Habits',
  'Lifestyle',
];

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName || !form.email || !form.password || !form.confirmPassword || !form.phone || !form.dateOfBirth || !form.sex || !form.occupation || !form.county || !form.residenceTown) {
        toast.error('Please fill in all personal information fields');
        return false;
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      if (new Date(form.dateOfBirth) >= new Date()) {
        toast.error('Date of birth cannot be in the future');
        return false;
      }
    }
    if (step === 1) {
      if (!form.height || !form.weight) {
        toast.error('Please enter height and weight');
        return false;
      }
      if (form.height < 50 || form.height > 250) {
        toast.error('Height must be between 50cm and 250cm');
        return false;
      }
      if (form.weight < 10 || form.weight > 400) {
        toast.error('Weight must be between 10kg and 400kg');
        return false;
      }
    }
    if (step === 3) {
      if (!form.balancedDietFrequency || !form.fruitVegFrequency || !form.fastFoodFrequency || !form.mealsPerDay) {
        toast.error('Please answer all dietary habit questions');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await signup(payload);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const heightM = Number(form.height) / 100;
  const liveBmi = form.height && form.weight ? Math.round((form.weight / (heightM * heightM)) * 10) / 10 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-8 px-4">
      <div className="card w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Your Account</h1>
        <p className="text-sm text-gray-500 mb-4">Step {step + 1} of {STEP_TITLES.length}: {STEP_TITLES[step]}</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label-text">Full Name</label>
                <input className="input-field" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Email Address</label>
                <input type="email" className="input-field" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Phone Number (Kenyan)</label>
                <input placeholder="07XXXXXXXX" className="input-field" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Password</label>
                <input type="password" className="input-field" value={form.password} onChange={(e) => update('password', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Confirm Password</label>
                <input type="password" className="input-field" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Date of Birth</label>
                <input type="date" max={new Date().toISOString().split('T')[0]} className="input-field" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Sex</label>
                <select className="input-field" value={form.sex} onChange={(e) => update('sex', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="label-text">Occupation</label>
                <input className="input-field" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} />
              </div>
              <div>
                <label className="label-text">County</label>
                <input className="input-field" value={form.county} onChange={(e) => update('county', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Residence / Town</label>
                <input className="input-field" value={form.residenceTown} onChange={(e) => update('residenceTown', e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Height (cm)</label>
                <input type="number" className="input-field" value={form.height} onChange={(e) => update('height', e.target.value)} />
              </div>
              <div>
                <label className="label-text">Weight (kg)</label>
                <input type="number" className="input-field" value={form.weight} onChange={(e) => update('weight', e.target.value)} />
              </div>
              {liveBmi && (
                <div className="sm:col-span-2 bg-primary-50 rounded-lg p-4 text-sm text-primary-800">
                  Your calculated BMI will be <strong>{liveBmi}</strong>.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label-text">Do you have any current medical conditions?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={!form.hasCurrentMedicalCondition} onChange={() => update('hasCurrentMedicalCondition', false)} /> No
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={form.hasCurrentMedicalCondition} onChange={() => update('hasCurrentMedicalCondition', true)} /> Yes
                  </label>
                </div>
                {form.hasCurrentMedicalCondition && (
                  <textarea
                    className="input-field mt-2"
                    placeholder="Please specify"
                    value={form.currentMedicalConditionDetails}
                    onChange={(e) => update('currentMedicalConditionDetails', e.target.value)}
                  />
                )}
              </div>

              <div>
                <label className="label-text">Family history of medical conditions?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={!form.hasFamilyMedicalHistory} onChange={() => update('hasFamilyMedicalHistory', false)} /> No
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={form.hasFamilyMedicalHistory} onChange={() => update('hasFamilyMedicalHistory', true)} /> Yes
                  </label>
                </div>
                {form.hasFamilyMedicalHistory && (
                  <textarea
                    className="input-field mt-2"
                    placeholder="Please specify"
                    value={form.familyMedicalHistoryDetails}
                    onChange={(e) => update('familyMedicalHistoryDetails', e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="label-text">How often do you eat a balanced diet?</label>
                <select className="input-field" value={form.balancedDietFrequency} onChange={(e) => update('balancedDietFrequency', e.target.value)}>
                  <option value="">Select</option>
                  {FREQUENCY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">How often do you eat fruits and vegetables?</label>
                <select className="input-field" value={form.fruitVegFrequency} onChange={(e) => update('fruitVegFrequency', e.target.value)}>
                  <option value="">Select</option>
                  {FREQUENCY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">How often do you consume fast foods, sugary drinks or fatty foods?</label>
                <select className="input-field" value={form.fastFoodFrequency} onChange={(e) => update('fastFoodFrequency', e.target.value)}>
                  <option value="">Select</option>
                  {FREQUENCY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">Meals per day</label>
                <select className="input-field" value={form.mealsPerDay} onChange={(e) => update('mealsPerDay', e.target.value)}>
                  <option value="">Select</option>
                  {MEALS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="label-text">Do you engage in physical activity?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={form.physicalActivity} onChange={() => update('physicalActivity', true)} /> Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={!form.physicalActivity} onChange={() => update('physicalActivity', false)} /> No
                  </label>
                </div>
              </div>
              <div>
                <label className="label-text">Do you use drugs?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={form.drugUse} onChange={() => update('drugUse', true)} /> Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={!form.drugUse} onChange={() => update('drugUse', false)} /> No
                  </label>
                </div>
                {form.drugUse && (
                  <textarea
                    className="input-field mt-2"
                    placeholder="Please specify"
                    value={form.drugUseDetails}
                    onChange={(e) => update('drugUseDetails', e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 0 ? (
              <button type="button" onClick={back} className="btn-secondary">Back</button>
            ) : <span />}

            {step < STEP_TITLES.length - 1 ? (
              <button type="button" onClick={next} className="btn-primary">Next</button>
            ) : (
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
