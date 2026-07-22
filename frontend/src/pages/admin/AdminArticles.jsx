import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const emptyForm = { title: '', summary: '', content: '', featuredImage: '' };

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/articles');
      setArticles(data.articles);
    } catch (err) {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (article) => {
    setEditingId(article._id);
    setForm({ title: article.title, summary: article.summary, content: article.content, featuredImage: article.featuredImage || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/articles/${editingId}`, form);
        toast.success('Article updated');
      } else {
        await api.post('/articles', form);
        toast.success('Article created');
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
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.delete(`/articles/${id}`);
      toast.success('Article deleted');
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Articles</h1>
          <p className="text-sm text-gray-500">{articles.length} article(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Article
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <div key={a._id} className="card !p-0 overflow-hidden">
              {a.featuredImage ? (
                <img src={a.featuredImage} alt={a.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-primary-50 flex items-center justify-center text-primary-300 text-sm">No image</div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{a.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.summary}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a)} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs py-1.5">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(a._id)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Title</label>
                <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Featured Image URL</label>
                <input className="input-field" placeholder="https://..." value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Summary</label>
                <textarea required className="input-field" rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Content</label>
                <textarea required className="input-field" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticles;
