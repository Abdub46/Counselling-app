import React from 'react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'rating', label: 'Top Rated' },
];

const ShopFilters = ({ categories, brands, filters, onChange, onClear }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Sort By</h3>
        <select className="input-field" value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Category</h3>
        <select className="input-field" value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Brand</h3>
        <select className="input-field" value={filters.brand} onChange={(e) => update('brand', e.target.value)}>
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Price Range (KSh)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="input-field"
            value={filters.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="input-field"
            value={filters.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Minimum Rating</h3>
        <select className="input-field" value={filters.minRating} onChange={(e) => update('minRating', e.target.value)}>
          <option value="">Any Rating</option>
          <option value="4">4★ & up</option>
          <option value="3">3★ & up</option>
          <option value="2">2★ & up</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={filters.inStock === 'true'} onChange={(e) => update('inStock', e.target.checked ? 'true' : '')} />
        In Stock Only
      </label>

      <button onClick={onClear} className="btn-secondary w-full">Clear Filters</button>
    </div>
  );
};

export default ShopFilters;
