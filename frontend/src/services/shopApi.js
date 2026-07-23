import api from './api';

// Products
export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const getProductSuggestions = (q) => api.get('/products/suggestions', { params: { q } }).then((r) => r.data.suggestions);
export const getProductBySlug = (slug) => api.get(`/products/slug/${slug}`).then((r) => r.data);

// Categories & Brands
export const getCategories = () => api.get('/categories').then((r) => r.data.categories);
export const getBrands = () => api.get('/brands').then((r) => r.data.brands);

// Reviews
export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`).then((r) => r.data.reviews);
export const submitReview = (payload) => api.post('/reviews', payload).then((r) => r.data);

// Wishlist
export const getWishlist = () => api.get('/wishlist').then((r) => r.data.wishlist);
export const toggleWishlist = (productId) => api.post('/wishlist/toggle', { productId }).then((r) => r.data);

// Coupons
export const validateCoupon = (code, subtotal) => api.post('/coupons/validate', { code, subtotal }).then((r) => r.data);

// Orders
export const createOrder = (payload) => api.post('/orders', payload).then((r) => r.data.order);
export const getMyOrders = () => api.get('/orders/my').then((r) => r.data.orders);
export const getOrderById = (id) => api.get(`/orders/${id}`).then((r) => r.data.order);

// Newsletter
export const subscribeNewsletter = (email) => api.post('/newsletter/subscribe', { email }).then((r) => r.data);

// ===================== ADMIN: Shop Management =====================

// Dashboard
export const getShopDashboard = () => api.get('/shop-admin/dashboard').then((r) => r.data);

// Products (admin)
export const getAdminProducts = (params) => api.get('/products/admin/all', { params }).then((r) => r.data);
export const getAdminProductById = (id) => api.get(`/products/admin/${id}`).then((r) => r.data.product);
export const createProduct = (payload) => api.post('/products', payload).then((r) => r.data.product);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((r) => r.data.product);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);
export const duplicateProduct = (id) => api.post(`/products/${id}/duplicate`).then((r) => r.data.product);
export const bulkProductAction = (ids, action) => api.post('/products/bulk', { ids, action }).then((r) => r.data);
export const uploadProductThumbnail = (id, file) => {
  const form = new FormData();
  form.append('image', file);
  return api.post(`/products/${id}/thumbnail`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};
export const uploadProductGallery = (id, files) => {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('images', f));
  return api.post(`/products/${id}/gallery`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};
export const removeProductGalleryImage = (id, imageUrl) =>
  api.delete(`/products/${id}/gallery`, { data: { imageUrl } }).then((r) => r.data);

// Categories (admin)
export const createCategory = (formData) =>
  api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.category);
export const updateCategory = (id, formData) =>
  api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.category);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

// Brands (admin)
export const createBrand = (formData) =>
  api.post('/brands', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.brand);
export const updateBrand = (id, formData) =>
  api.put(`/brands/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.brand);
export const deleteBrand = (id) => api.delete(`/brands/${id}`).then((r) => r.data);

// Orders (admin)
export const getAllOrders = (params) => api.get('/orders', { params }).then((r) => r.data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then((r) => r.data.order);

// Reviews (admin)
export const getAllReviews = (params) => api.get('/reviews', { params }).then((r) => r.data.reviews);
export const approveReview = (id) => api.put(`/reviews/${id}/approve`).then((r) => r.data.review);
export const hideReview = (id) => api.put(`/reviews/${id}/hide`).then((r) => r.data.review);
export const deleteReview = (id) => api.delete(`/reviews/${id}`).then((r) => r.data);
export const replyToReview = (id, reply) => api.put(`/reviews/${id}/reply`, { reply }).then((r) => r.data.review);

// Coupons (admin)
export const getCoupons = () => api.get('/coupons').then((r) => r.data.coupons);
export const createCoupon = (payload) => api.post('/coupons', payload).then((r) => r.data.coupon);
export const updateCoupon = (id, payload) => api.put(`/coupons/${id}`, payload).then((r) => r.data.coupon);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`).then((r) => r.data);

