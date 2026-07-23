import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../services/shopApi';

const emptyForm = { name: '', description: '' };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCategories().then(setCategories).catch(() => toast.error('Failed to load categories')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setImageFile(null); setModalOpen(true); };
  const openEdit = (cat) => { setEditingId(cat._id); setForm({ name: cat.name, description: cat.description }); setImageFile(null); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success('Category updated');
      } else {
        await createCategory(formData);
        toast.success('Category created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Category</button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div key={c._id} className="card !p-4 text-center">
              {c.image ? (
                <img src={c.image} alt={c.name} className="h-16 w-16 rounded-full object-cover mx-auto mb-2" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center text-2xl mx-auto mb-2">🧴</div>
              )}
              <p className="font-medium text-gray-800 text-sm mb-2">{c.name}</p>
              <div className="flex justify-center gap-2">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Name</label>
                <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Image</label>
                <input type="file" accept="image/*" className="input-field" onChange={(e) => setImageFile(e.target.files[0])} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Category'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
