import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/articles')
      .then(({ data }) => setArticles(data.articles))
      .catch(() => toast.error('Failed to load articles'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Nutrition Articles</h1>
        <p className="text-sm text-gray-500">Learn more about healthy eating and lifestyle</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading articles...</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-gray-500">No articles published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <Link key={a._id} to={`/articles/${a._id}`} className="card hover:shadow-md transition-shadow overflow-hidden !p-0">
              {a.featuredImage ? (
                <img src={a.featuredImage} alt={a.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-primary-50 flex items-center justify-center text-primary-300 text-sm">No image</div>
              )}
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-1">{new Date(a.publishedAt).toLocaleDateString()}</p>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{a.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{a.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;
