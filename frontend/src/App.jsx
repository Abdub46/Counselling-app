import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import BmiCalculator from './pages/BmiCalculator';
import Chatbot from './pages/Chatbot';
import Appointments from './pages/Appointments';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Tools from './pages/Tools';

import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminArticles from './pages/admin/AdminArticles';

import ShopHome from './pages/shop/ShopHome';
import ShopProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import OrderSuccess from './pages/shop/OrderSuccess';
import OrderHistory from './pages/shop/OrderHistory';
import OrderDetail from './pages/shop/OrderDetail';

import AdminShopDashboard from './pages/admin/shop/AdminShopDashboard';
import AdminProducts from './pages/admin/shop/AdminProducts';
import AdminProductForm from './pages/admin/shop/AdminProductForm';
import AdminCategories from './pages/admin/shop/AdminCategories';
import AdminBrands from './pages/admin/shop/AdminBrands';
import AdminOrders from './pages/admin/shop/AdminOrders';
import AdminReviews from './pages/admin/shop/AdminReviews';

const withLayout = (Component) => (
  <Layout>
    <Component />
  </Layout>
);

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" /> : <Signup />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Client routes */}
        <Route path="/dashboard" element={<ProtectedRoute>{withLayout(Dashboard)}</ProtectedRoute>} />
        <Route path="/bmi-calculator" element={<ProtectedRoute>{withLayout(BmiCalculator)}</ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute>{withLayout(Chatbot)}</ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute>{withLayout(Appointments)}</ProtectedRoute>} />
        <Route path="/articles" element={<ProtectedRoute>{withLayout(Articles)}</ProtectedRoute>} />
        <Route path="/articles/:id" element={<ProtectedRoute>{withLayout(ArticleDetail)}</ProtectedRoute>} />
        <Route path="/tools" element={<ProtectedRoute>{withLayout(Tools)}</ProtectedRoute>} />

        {/* Shop routes (client) - accessible via Footer link only, not main nav */}
        <Route path="/shop" element={<ProtectedRoute>{withLayout(ShopHome)}</ProtectedRoute>} />
        <Route path="/shop/product/:slug" element={<ProtectedRoute>{withLayout(ShopProductDetail)}</ProtectedRoute>} />
        <Route path="/shop/cart" element={<ProtectedRoute>{withLayout(Cart)}</ProtectedRoute>} />
        <Route path="/shop/checkout" element={<ProtectedRoute>{withLayout(Checkout)}</ProtectedRoute>} />
        <Route path="/shop/order-success" element={<ProtectedRoute>{withLayout(OrderSuccess)}</ProtectedRoute>} />
        <Route path="/shop/orders" element={<ProtectedRoute>{withLayout(OrderHistory)}</ProtectedRoute>} />
        <Route path="/shop/orders/:id" element={<ProtectedRoute>{withLayout(OrderDetail)}</ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute>{withLayout(AdminHome)}</AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute>{withLayout(AdminUsers)}</AdminRoute>} />
        <Route path="/admin/appointments" element={<AdminRoute>{withLayout(AdminAppointments)}</AdminRoute>} />
        <Route path="/admin/articles" element={<AdminRoute>{withLayout(AdminArticles)}</AdminRoute>} />

        {/* Admin: Shop Management */}
        <Route path="/admin/shop" element={<AdminRoute>{withLayout(AdminShopDashboard)}</AdminRoute>} />
        <Route path="/admin/shop/products" element={<AdminRoute>{withLayout(AdminProducts)}</AdminRoute>} />
        <Route path="/admin/shop/products/new" element={<AdminRoute>{withLayout(AdminProductForm)}</AdminRoute>} />
        <Route path="/admin/shop/products/:id/edit" element={<AdminRoute>{withLayout(AdminProductForm)}</AdminRoute>} />
        <Route path="/admin/shop/categories" element={<AdminRoute>{withLayout(AdminCategories)}</AdminRoute>} />
        <Route path="/admin/shop/brands" element={<AdminRoute>{withLayout(AdminBrands)}</AdminRoute>} />
        <Route path="/admin/shop/orders" element={<AdminRoute>{withLayout(AdminOrders)}</AdminRoute>} />
        <Route path="/admin/shop/reviews" element={<AdminRoute>{withLayout(AdminReviews)}</AdminRoute>} />

        <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
      </Routes>
    </>
  );
}

export default App;
