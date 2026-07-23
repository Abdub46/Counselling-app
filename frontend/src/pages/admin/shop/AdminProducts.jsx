import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Copy, Eye, EyeOff, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminProducts, deleteProduct, duplicateProduct, bulkProductAction, getCategories, getBrands,
} from '../../../services/shopApi';
import { formatKsh } from '../../../utils/format';

const STATUS_COLORS = {
  Published: 'bg-green-100 text-green-700',
  Hidden: 'bg-yellow-100 text-yellow-700',
  Draft: 'bg-gray-100 text-gray-600',
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [filters, setFilters] = useState({ q: '', status: '', category: '', brand: '', sort: 'newest' });

  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([c, b]) => { setCategories(c); setBrands(b); });
  }, []);

  const load = useCallback((page = 1) => {
    setLoading(true);
    getAdminProducts({ ...filters, page, limit: 20 })
      .then((data) => { setProducts(data.products); setPagination(data.pagination); })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  const toggleSelect = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = () => setSelected(selected.length === products.length ? [] : products.map((p) => p._id));

  const handleBulk = async (action) => {
    if (selected.length === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selected.length} product(s)? This cannot be undone.`)) return;
    try {
      await bulkProductAction(selected, action);
      toast.success(`Bulk ${action} completed`);
      setSelected([]);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateProduct(id);
      toast.success('Product duplicated as Draft');
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Duplicate failed');
    }
  };

  const togglePublish = async (product) => {
    try {
      await bulkProductAction([product._id], product.status === 'Published' ? 'hide' : 'publish');
      toast.success(product.status === 'Published' ? 'Product hidden' : 'Product published');
      load(pagination.page);
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">{pagination.total || 0} product(s)</p>
        </div>
        <Link to="/admin/shop/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by name..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
        </div>
        <select className="input-field w-auto" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Hidden">Hidden</option>
          <option value="Draft">Draft</option>
        </select>
        <select className="input-field w-auto" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="input-field w-auto" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })}>
          <option value="">All Brands</option>
          {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select className="input-field w-auto" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-primary-50 rounded-lg px-4 py-2.5 text-sm">
          <span className="font-medium text-primary-700">{selected.length} selected</span>
          <button onClick={() => handleBulk('publish')} className="text-primary-700 hover:underline">Publish</button>
          <button onClick={() => handleBulk('hide')} className="text-primary-700 hover:underline">Hide</button>
          <button onClick={() => handleBulk('delete')} className="text-red-600 hover:underline">Delete</button>
        </div>
      )}

      <div className="card overflow-x-auto !p-0">
        {loading ? (
          <p className="p-5 text-sm text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">No products found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" checked={selected.length === products.length} onChange={toggleSelectAll} /></th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center">💊</div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand?.name} • {p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-700">{formatKsh(p.finalPrice ?? p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stockQuantity === 0 ? 'text-red-500' : p.stockQuantity <= 10 ? 'text-yellow-600' : 'text-gray-600'}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link to={`/admin/shop/products/${p._id}/edit`} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Edit">
                        <Edit2 size={15} />
                      </Link>
                      <button onClick={() => togglePublish(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title={p.status === 'Published' ? 'Hide' : 'Publish'}>
                        {p.status === 'Published' ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => handleDuplicate(p._id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Duplicate">
                        <Copy size={15} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => load(pg)}
              className={`h-9 w-9 rounded-lg text-sm font-medium ${pg === pagination.page ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {pg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
