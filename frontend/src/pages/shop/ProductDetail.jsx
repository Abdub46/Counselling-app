import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Facebook, Twitter, Link2, ChevronRight, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getProductBySlug, getProductReviews, submitReview, toggleWishlist, getWishlist,
} from '../../services/shopApi';
import { formatKsh } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/shop/ProductCard';

const TABS = ['Description', 'Ingredients', 'Nutrition Facts', 'Usage & Warnings', 'Reviews'];

const ShopProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('Description');
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    let loadedProduct = null;
    getProductBySlug(slug)
      .then(({ product: p, related: r }) => {
        loadedProduct = p;
        setProduct(p);
        setRelated(r);
        return Promise.all([getProductReviews(p._id), user ? getWishlist() : Promise.resolve(null)]);
      })
      .then(([revs, wishlist]) => {
        setReviews(revs);
        if (wishlist && loadedProduct) {
          setWishlisted(wishlist.products.some((prod) => (prod._id || prod) === loadedProduct._id));
        }
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return <p className="pt-10 text-center text-gray-500">Product not found.</p>;

  const outOfStock = product.stockQuantity <= 0;
  const finalPrice = product.finalPrice ?? product.price;
  const images = [product.thumbnail, ...(product.gallery || [])].filter(Boolean);
  const inCart = isInCart(product._id);

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart(product, quantity);
    navigate('/shop/cart');
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please log in to save items to your wishlist');
      return;
    }
    try {
      const { added } = await toggleWishlist(product._id);
      setWishlisted(added);
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      return;
    }
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(product.name)}`,
    };
    window.open(shareUrls[platform], '_blank', 'noreferrer');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview({ productId: product._id, ...reviewForm });
      toast.success('Review submitted — pending approval');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="pt-4 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
        <Link to="/shop" className="hover:text-primary-600">Shop</Link>
        <ChevronRight size={12} />
        <span className="hover:text-primary-600">{product.category?.name}</span>
        <ChevronRight size={12} />
        <span className="text-gray-700 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl text-primary-200">💊</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    i === activeImage ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.brand?.name}</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>

          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1.5 mb-3 text-sm text-gray-600">
              <Star size={15} className="text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{product.ratingAverage}</span>
              <span className="text-gray-400">({product.ratingCount} reviews)</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <p className="text-2xl font-bold text-primary-700">{formatKsh(finalPrice)}</p>
            {product.discountPercent > 0 && (
              <>
                <p className="text-gray-400 line-through">{formatKsh(product.price)}</p>
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                  -{product.discountPercent}%
                </span>
              </>
            )}
          </div>

          <p className={`text-sm font-medium mb-5 ${outOfStock ? 'text-red-500' : 'text-primary-600'}`}>
            {outOfStock ? 'Out of Stock' : `In Stock (${product.stockQuantity} available)`}
          </p>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Quantity + actions */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2.5 text-gray-500 hover:bg-gray-50">
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))} className="p-2.5 text-gray-500 hover:bg-gray-50">
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-lg border ${wishlisted ? 'border-red-200 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:text-red-500'}`}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || inCart}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart size={16} /> {inCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow} disabled={outOfStock} className="btn-primary flex-1 disabled:opacity-50">
              Buy Now
            </button>
          </div>

          {/* Social share */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Share:</span>
            <button onClick={() => handleShare('facebook')} className="text-gray-400 hover:text-primary-600"><Facebook size={16} /></button>
            <button onClick={() => handleShare('twitter')} className="text-gray-400 hover:text-primary-600"><Twitter size={16} /></button>
            <button onClick={() => handleShare('copy')} className="text-gray-400 hover:text-primary-600"><Link2 size={16} /></button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 mb-5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="card">
          {activeTab === 'Description' && (
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>{product.description}</p>
              {product.benefits && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Benefits</h4>
                  <p className="whitespace-pre-line">{product.benefits}</p>
                </div>
              )}
              {product.suitableFor && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Suitable For</h4>
                  <p className="whitespace-pre-line">{product.suitableFor}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Ingredients' && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{product.ingredients || 'No ingredient information provided.'}</p>
          )}

          {activeTab === 'Nutrition Facts' && (
            <div className="text-sm text-gray-600 space-y-2">
              {product.servingSize && <p><span className="font-medium text-gray-800">Serving Size:</span> {product.servingSize}</p>}
              <p className="whitespace-pre-line">{product.nutritionFacts || 'No nutrition facts provided.'}</p>
            </div>
          )}

          {activeTab === 'Usage & Warnings' && (
            <div className="text-sm text-gray-600 space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Recommended Usage</h4>
                <p className="whitespace-pre-line">{product.usageInstructions || 'Follow packaging instructions.'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Warnings</h4>
                <p className="whitespace-pre-line">{product.warnings || 'Consult a healthcare professional before use if pregnant, nursing, or on medication.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet — be the first to review this product.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={13} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{r.user?.fullName}</span>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                      {r.adminReply && (
                        <div className="mt-2 bg-primary-50 rounded-lg p-3 text-xs text-gray-600">
                          <span className="font-semibold text-primary-700">Response from NutriCounsel: </span>
                          {r.adminReply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="font-semibold text-gray-800 text-sm">Write a Review</h4>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                    >
                      <Star size={20} className={i < reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Share your experience with this product..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
                <button type="submit" disabled={submittingReview} className="btn-primary">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductDetailSkeleton = () => (
  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
    <div className="aspect-square bg-gray-100 rounded-2xl" />
    <div className="space-y-3">
      <div className="h-3 bg-gray-100 rounded w-1/4" />
      <div className="h-6 bg-gray-100 rounded w-2/3" />
      <div className="h-8 bg-gray-100 rounded w-1/3" />
      <div className="h-20 bg-gray-100 rounded w-full" />
      <div className="h-10 bg-gray-100 rounded w-full" />
    </div>
  </div>
);

export default ShopProductDetail;
