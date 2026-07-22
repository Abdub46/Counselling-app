import React, { useEffect, useState } from 'react';
import { Eye, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const viewUser = async (id) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      setSelected(data.user);
      setEditForm(data.user);
      setEditMode(false);
    } catch (err) {
      toast.error('Failed to load user detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/users/${selected._id}`, {
        fullName: editForm.fullName,
        phone: editForm.phone,
        occupation: editForm.occupation,
        county: editForm.county,
        residenceTown: editForm.residenceTown,
        height: Number(editForm.height),
        weight: Number(editForm.weight),
      });
      toast.success('User updated');
      setSelected(data.user);
      setEditMode(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500">{users.length} registered client(s)</p>
      </div>

      <div className="card overflow-x-auto !p-0">
        {loading ? (
          <p className="p-5 text-sm text-gray-500">Loading users...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">County</th>
                <th className="text-left px-4 py-3">Occupation</th>
                <th className="text-left px-4 py-3">BMI</th>
                <th className="text-left px-4 py-3">Registered</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{u.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{u.county}</td>
                  <td className="px-4 py-3 text-gray-600">{u.occupation}</td>
                  <td className="px-4 py-3 text-gray-600">{u.bmi} ({u.bmiCategory})</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(u.registrationDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => viewUser(u._id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-800">{selected.fullName}</h2>
              <div className="flex items-center gap-3">
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="text-sm text-primary-600 font-medium">Edit</button>
                )}
                <button onClick={() => setSelected(null)}><X size={20} /></button>
              </div>
            </div>

            {!editMode ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Email" value={selected.email} />
                <Detail label="Phone" value={selected.phone} />
                <Detail label="Sex" value={selected.sex} />
                <Detail label="Occupation" value={selected.occupation} />
                <Detail label="County" value={selected.county} />
                <Detail label="Residence" value={selected.residenceTown} />
                <Detail label="Height" value={`${selected.height} cm`} />
                <Detail label="Weight" value={`${selected.weight} kg`} />
                <Detail label="BMI" value={selected.bmi} />
                <Detail label="Meals/day" value={selected.mealsPerDay} />
                <Detail label="Balanced diet freq." value={selected.balancedDietFrequency} />
                <Detail label="Fruit/veg freq." value={selected.fruitVegFrequency} />
                <Detail label="Fast food freq." value={selected.fastFoodFrequency} />
                <Detail label="Physical activity" value={selected.physicalActivity ? 'Yes' : 'No'} />
                <Detail label="Current condition" value={selected.hasCurrentMedicalCondition ? (selected.currentMedicalConditionDetails || 'Yes') : 'No'} />
                <Detail label="Family history" value={selected.hasFamilyMedicalHistory ? (selected.familyMedicalHistoryDetails || 'Yes') : 'No'} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <EditField label="Full Name" value={editForm.fullName} onChange={(v) => setEditForm({ ...editForm, fullName: v })} />
                  <EditField label="Phone" value={editForm.phone} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
                  <EditField label="Occupation" value={editForm.occupation} onChange={(v) => setEditForm({ ...editForm, occupation: v })} />
                  <EditField label="County" value={editForm.county} onChange={(v) => setEditForm({ ...editForm, county: v })} />
                  <EditField label="Residence" value={editForm.residenceTown} onChange={(v) => setEditForm({ ...editForm, residenceTown: v })} />
                  <EditField label="Height (cm)" type="number" value={editForm.height} onChange={(v) => setEditForm({ ...editForm, height: v })} />
                  <EditField label="Weight (kg)" type="number" value={editForm.weight} onChange={(v) => setEditForm({ ...editForm, weight: v })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveEdit} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
                  <button onClick={() => { setEditMode(false); setEditForm(selected); }} className="btn-secondary">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-gray-800">{value}</p>
  </div>
);

const EditField = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="label-text">{label}</label>
    <input type={type} className="input-field" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default AdminUsers;
