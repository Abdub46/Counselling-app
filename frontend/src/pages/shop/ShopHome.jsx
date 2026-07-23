import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Truck, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, getCategories, getBrands } from '../../services/shopApi';
import ProductCard from '../../components/shop/ProductCard';
import ProductGridSkeleton from '../../components/shop/ProductGridSkeleton';
import EmptyState from '../../components/shop/EmptyState';
import ShopFilters from '../../components/shop/ShopFilters';
import ShopSearchBar from '../../components/shop/ShopSearchBar';

const DEFAULT_FILTERS = { category: '', brand: '', minPrice: '', maxPrice: '', minRating: '', inStock: '', sort: 'newest', q: '' };

const ShopHome = () => {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load homepage sections + filter data once
  useEffect(() => {
    Promise.all([
      getProducts({ featured: 'true', limit: 4 }),
      getProducts({ newArrival: 'true', limit: 4 }),
      getProducts({ bestSeller: 'true', limit: 4 }),
      getCategories(),
      getBrands(),
    ])
      .then(([f, n, b, cats, brds]) => {
        setFeatured(f.products);
        setNewArrivals(n.products);
        setBestSellers(b.products);
        setCategories(cats);
        setBrands(brds);
      })
      .catch(() => toast.error('Failed to load shop data'));
  }, []);

  const loadProducts = useCallback((page = 1) => {
    setLoading(true);
    getProducts({ ...filters, page, limit: 12 })
      .then((data) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = (q) => setFilters((f) => ({ ...f, q }));
  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="pt-4 space-y-14 pb-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-blue-50 border border-gray-100 px-6 py-12 md:py-16 text-center md:text-left">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={13} /> Premium Wellness Supplements
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 leading-tight">
              Fuel Your Body with Science-Backed Nutrition
            </h1>
            <p className="text-gray-500 mb-6 max-w-md mx-auto md:mx-0">
              Carefully sourced supplements, vetted by our nutrition team — built to support the goals in your dashboard.
            </p>
            <div className="flex justify-center md:justify-start">
              <a href="#shop-grid" className="btn-primary px-6 py-3">Shop Now</a>
            </div>
          </div>
          <div className="hidden md:flex justify-center text-8xl">🌿💊</div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-10 pt-8 border-t border-gray-100/60">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <ShieldCheck size={20} className="text-primary-600" />
            <p className="text-xs text-gray-500">Quality Assured</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Truck size={20} className="text-primary-600" />
            <p className="text-xs text-gray-500">Fast Delivery</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Sparkles size={20} className="text-primary-600" />
            <p className="text-xs text-gray-500">Nutritionist Approved</p>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && <ProductSection title="Featured Supplements" products={featured} />}

      {/* New arrivals */}
      {newArrivals.length > 0 && <ProductSection title="New Arrivals" products={newArrivals} />}

      {/* Best sellers */}
      {bestSellers.length > 0 && <ProductSection title="Best Sellers" products={bestSellers} />}

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((c) => (
              <button
                key={c._id}
                onClick={() => setFilters((f) => ({ ...f, category: c._id }))}
                className="card !p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center"
              >
                {c.image ? (
                  <img src={c.image} alt={c.name} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center text-2xl">🧴</div>
                )}
                <span className="text-sm font-medium text-gray-700">{c.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Main grid with filters */}
      <section id="shop-grid">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">All Supplements</h2>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>

        <div className="mb-5">
          <ShopSearchBar initialValue={filters.q} onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Desktop filters */}
          <div className="hidden lg:block">
            <div className="card sticky top-6">
              <ShopFilters categories={categories} brands={brands} filters={filters} onChange={setFilters} onClear={clearFilters} />
            </div>
          </div>

          {/* Mobile filters drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
              <div className="bg-white h-full w-80 max-w-[85vw] p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)}><X size={20} /></button>
                </div>
                <ShopFilters categories={categories} brands={brands} filters={filters} onChange={setFilters} onClear={clearFilters} />
              </div>
            </div>
          )}

          {/* Grid */}
          <div>
            {loading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No products found"
                message="Try adjusting your filters or search terms."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => loadProducts(pg)}
                        className={`h-9 w-9 rounded-lg text-sm font-medium ${
                          pg === pagination.page ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductSection = ({ title, products }) => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  </section>
);

export default ShopHome;
