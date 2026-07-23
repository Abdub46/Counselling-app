import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createProduct, updateProduct, getCategories, getBrands, getAdminProductById,
  uploadProductThumbnail, uploadProductGallery, removeProductGalleryImage,
} from '../../../services/shopApi';

const emptyForm = {
  name: '', sku: '', brand: '', category: '', price: '', discountPercent: '', stockQuantity: '',
  description: '', benefits: '', ingredients: '', nutritionFacts: '', servingSize: '',
  usageInstructions: '', warnings: '', suitableFor: '', tags: '',
  isFeatured: false, isBestSeller: false, isNewArrival: false, status: 'Draft',
};

const AdminProductForm = () => {
  const { id } = useParams(); // undefined when creating
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const [thumbnail, setThumbnail] = useState('');
  const [gallery, setGallery] = useState([]);
  const [productId, setProductId] = useState(id || null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([c, b]) => { setCategories(c); setBrands(b); });
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    getAdminProductById(id)
      .then((product) => {
        setForm({
          name: product.name, sku: product.sku,
          brand: product.brand?._id || product.brand,
          category: product.category?._id || product.category,
          price: product.price, discountPercent: product.discountPercent,
          stockQuantity: product.stockQuantity, description: product.description,
          benefits: product.benefits, ingredients: product.ingredients,
          nutritionFacts: product.nutritionFacts, servingSize: product.servingSize,
          usageInstructions: product.usageInstructions, warnings: product.warnings,
          suitableFor: product.suitableFor, tags: (product.tags || []).join(', '),
          isFeatured: product.isFeatured, isBestSeller: product.isBestSeller, isNewArrival: product.isNewArrival,
          status: product.status,
        });
        setThumbnail(product.thumbnail);
        setGallery(product.gallery || []);
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.brand || !form.category || !form.price || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), discountPercent: Number(form.discountPercent) || 0, stockQuantity: Number(form.stockQuantity) || 0 };
      if (isEditing) {
        await updateProduct(id, payload);
        toast.success('Product updated');
      } else {
        const created = await createProduct(payload);
        toast.success('Product created — you can now upload images');
        setProductId(created._id);
        navigate(`/admin/shop/products/${created._id}/edit`, { replace: true });
        return;
      }
      navigate('/admin/shop/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !productId) return;
    setUploadingThumb(true);
    try {
      const { thumbnail: url } = await uploadProductThumbnail(productId, file);
      setThumbnail(url);
      toast.success('Thumbnail uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files.length || !productId) return;
    setUploadingGallery(true);
    try {
      const { gallery: updated } = await uploadProductGallery(productId, files);
      setGallery(updated);
      toast.success('Gallery images uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = async (imageUrl) => {
    try {
      const { gallery: updated } = await removeProductGalleryImage(productId, imageUrl);
      setGallery(updated);
    } catch (err) {
      toast.error('Failed to remove image');
    }
  };

  if (loading) return <p className="pt-8 text-sm text-gray-500">Loading product...</p>;

  return (
    <div className="pt-4 max-w-3xl space-y-6">
      <Link to="/admin/shop/products" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-text">Product Name</label>
              <input required className="input-field" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="label-text">SKU</label>
              <input required className="input-field" value={form.sku} onChange={(e) => update('sku', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Tags (comma-separated)</label>
              <input className="input-field" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Brand</label>
              <select required className="input-field" value={form.brand} onChange={(e) => update('brand', e.target.value)}>
                <option value="">Select Brand</option>
                {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Category</label>
              <select required className="input-field" value={form.category} onChange={(e) => update('category', e.target.value)}>
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Price (KSh)</label>
              <input required type="number" className="input-field" value={form.price} onChange={(e) => update('price', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Discount (%)</label>
              <input type="number" min="0" max="100" className="input-field" value={form.discountPercent} onChange={(e) => update('discountPercent', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Stock Quantity</label>
              <input type="number" min="0" className="input-field" value={form.stockQuantity} onChange={(e) => update('stockQuantity', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Status</label>
              <select className="input-field" value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} /> Featured Product
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => update('isBestSeller', e.target.checked)} /> Best Seller
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isNewArrival} onChange={(e) => update('isNewArrival', e.target.checked)} /> New Arrival
            </label>
          </div>
        </div>

        {/* Descriptions */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Product Details</h2>
          <div>
            <label className="label-text">Description</label>
            <textarea required className="input-field" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div>
            <label className="label-text">Benefits</label>
            <textarea className="input-field" rows={2} value={form.benefits} onChange={(e) => update('benefits', e.target.value)} />
          </div>
          <div>
            <label className="label-text">Ingredients</label>
            <textarea className="input-field" rows={2} value={form.ingredients} onChange={(e) => update('ingredients', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Nutrition Facts</label>
              <textarea className="input-field" rows={2} value={form.nutritionFacts} onChange={(e) => update('nutritionFacts', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Serving Size</label>
              <input className="input-field" value={form.servingSize} onChange={(e) => update('servingSize', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-text">Usage Instructions</label>
            <textarea className="input-field" rows={2} value={form.usageInstructions} onChange={(e) => update('usageInstructions', e.target.value)} />
          </div>
          <div>
            <label className="label-text">Warnings</label>
            <textarea className="input-field" rows={2} value={form.warnings} onChange={(e) => update('warnings', e.target.value)} />
          </div>
          <div>
            <label className="label-text">Suitable For</label>
            <textarea className="input-field" rows={2} value={form.suitableFor} onChange={(e) => update('suitableFor', e.target.value)} />
          </div>
        </div>

        {/* Images - only available once the product exists */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Images</h2>
          {!productId ? (
            <p className="text-sm text-gray-500">Save the product first to unlock image uploads.</p>
          ) : (
            <>
              <div>
                <p className="label-text">Thumbnail</p>
                <div className="flex items-center gap-4">
                  {thumbnail ? (
                    <img src={thumbnail} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">No image</div>
                  )}
                  <label className="btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                    <Upload size={14} /> {uploadingThumb ? 'Uploading...' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploadingThumb} />
                  </label>
                </div>
              </div>

              <div>
                <p className="label-text">Gallery Images</p>
                <div className="flex flex-wrap gap-3 mb-3">
                  {gallery.map((img) => (
                    <div key={img} className="relative">
                      <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(img)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
                  <Upload size={14} /> {uploadingGallery ? 'Uploading...' : 'Upload Images (drag files or click, up to 8)'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                </label>
              </div>
            </>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto px-8">
          {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
