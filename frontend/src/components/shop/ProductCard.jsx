import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatKsh } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toggleWishlist } from '../../services/shopApi';

const ProductCard = ({ product, wishlisted = false, onWishlistChange }) => {
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  const finalPrice = product.finalPrice ?? product.price;
  const hasDiscount = product.discountPercent > 0;
  const outOfStock = product.stockQuantity <= 0;
  const inCart = isInCart(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (outOfStock || inCart) return;
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to save items to your wishlist');
      return;
    }
    try {
      const { added } = await toggleWishlist(product._id);
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
      onWishlistChange?.();
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  return (
    <Link
      to={`/shop/product/${product.slug}`}
      className="group card !p-0 overflow-hidden relative flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-1 rounded-full">
            -{product.discountPercent}%
          </span>
        )}
        {product.isNewArrival && (
          <span className="bg-accent-500 text-white text-[11px] font-semibold px-2 py-1 rounded-full">New</span>
        )}
        {product.isBestSeller && (
          <span className="bg-primary-600 text-white text-[11px] font-semibold px-2 py-1 rounded-full">Best Seller</span>
        )}
      </div>

      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm transition-colors ${
          wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
        aria-label="Toggle wishlist"
      >
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-primary-200">💊</div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{product.brand?.name}</p>
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>

        {product.ratingCount > 0 && (
          <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
            <span>{product.ratingAverage}</span>
            <span className="text-gray-400">({product.ratingCount})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="font-bold text-primary-700">{formatKsh(finalPrice)}</p>
            {hasDiscount && <p className="text-xs text-gray-400 line-through">{formatKsh(product.price)}</p>}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || inCart}
            className="p-2.5 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-primary-50 disabled:hover:text-primary-700"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
