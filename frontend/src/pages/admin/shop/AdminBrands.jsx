import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../../services/shopApi';

const emptyForm = { name: '', description: '' };

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getBrands().then(setBrands).catch(() => toast.error('Failed to load brands')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setLogoFile(null); setModalOpen(true); };
  const openEdit = (brand) => { setEditingId(brand._id); setForm({ name: brand.name, description: brand.description }); setLogoFile(null); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (logoFile) formData.append('logo', logoFile);

      if (editingId) {
        await updateBrand(editingId, formData);
        toast.success('Brand updated');
      } else {
        await createBrand(formData);
        toast.success('Brand created');
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
    if (!window.confirm('Delete this brand?')) return;
    try {
      await deleteBrand(id);
      toast.success('Brand deleted');
      setBrands((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
          <p className="text-sm text-gray-500">{brands.length} brand(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Brand</button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {brands.map((b) => (
            <div key={b._id} className="card !p-4 text-center">
              {b.logo ? (
                <img src={b.logo} alt={b.name} className="h-16 w-16 rounded-full object-cover mx-auto mb-2" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center text-2xl mx-auto mb-2">🏷️</div>
              )}
              <p className="font-medium text-gray-800 text-sm mb-2">{b.name}</p>
              <div className="flex justify-center gap-2">
                <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Brand' : 'New Brand'}</h2>
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
                <label className="label-text">Logo</label>
                <input type="file" accept="image/*" className="input-field" onChange={(e) => setLogoFile(e.target.files[0])} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Brand'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
