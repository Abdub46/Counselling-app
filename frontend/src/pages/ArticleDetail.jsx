import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/articles/${id}`)
      .then(({ data }) => setArticle(data.article))
      .catch(() => toast.error('Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="pt-8 text-sm text-gray-500">Loading...</p>;
  if (!article) return <p className="pt-8 text-sm text-gray-500">Article not found.</p>;

  return (
    <div className="pt-4 max-w-2xl mx-auto space-y-4">
      <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
        <ArrowLeft size={16} /> Back to Articles
      </Link>

      {article.featuredImage && (
        <img src={article.featuredImage} alt={article.title} className="w-full h-64 object-cover rounded-xl" />
      )}

      <div>
        <p className="text-xs text-gray-400 mb-1">{new Date(article.publishedAt).toLocaleDateString()}</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">{article.title}</h1>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{article.content}</p>
      </div>
    </div>
  );
};

export default ArticleDetail;
