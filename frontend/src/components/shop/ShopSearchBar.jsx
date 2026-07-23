import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { getProductSuggestions } from '../../services/shopApi';

const ShopSearchBar = ({ initialValue = '', onSearch }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      getProductSuggestions(query).then(setSuggestions).catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query);
  };

  const selectSuggestion = (product) => {
    setShowSuggestions(false);
    setQuery(product.name);
    navigate(`/shop/product/${product.slug}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input-field pl-10 pr-9"
          placeholder="Search supplements, brands, categories..."
          value={query}
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onSearch(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s._id}
              onClick={() => selectSuggestion(s)}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 text-left"
            >
              {s.thumbnail ? (
                <img src={s.thumbnail} alt="" className="h-9 w-9 rounded object-cover" />
              ) : (
                <div className="h-9 w-9 rounded bg-primary-50 flex items-center justify-center text-sm">💊</div>
              )}
              <span className="text-sm text-gray-700 line-clamp-1">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopSearchBar;
