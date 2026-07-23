import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  MessageCircle,
  CalendarDays,
  Newspaper,
  Wrench,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ShoppingCart,
  ShoppingBag,
  Tags,
  Award,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Footer from './Footer';
import Newsletter from './Newsletter';

const clientLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bmi-calculator', label: 'BMI Calculator', icon: Calculator },
  { to: '/chatbot', label: 'AI Chatbot', icon: MessageCircle },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/articles', label: 'Articles', icon: Newspaper },
  { to: '/tools', label: 'Tools', icon: Wrench },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Home', icon: ShieldCheck },
  { to: '/admin/users', label: 'Users', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/admin/articles', label: 'Articles', icon: Newspaper },
];

const shopManagementLinks = [
  { to: '/admin/shop', label: 'Shop Dashboard', icon: ShoppingBag },
  { to: '/admin/shop/products', label: 'Products', icon: Tags },
  { to: '/admin/shop/categories', label: 'Categories', icon: Tags },
  { to: '/admin/shop/brands', label: 'Brands', icon: Award },
  { to: '/admin/shop/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/shop/reviews', label: 'Reviews', icon: Star },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : clientLinks;
  const bottomNavLinks = links.slice(0, 5);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-100 fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-primary-700">NutriCounsel</h1>
            <p className="text-xs text-gray-500 mt-0.5">{isAdmin ? 'Admin Panel' : 'Client Portal'}</p>
          </div>
          {!isAdmin && (
            <NavLink to="/shop/cart" className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-600" aria-label="Cart">
              <ShoppingCart size={19} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </NavLink>
          )}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Shop Management</p>
              {shopManagementLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin/shop'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-primary-700">NutriCounsel</h1>
        <div className="flex items-center gap-1">
          {!isAdmin && (
            <NavLink to="/shop/cart" className="relative p-2" aria-label="Cart">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </NavLink>
          )}
          <button onClick={() => setMobileOpen(true)} className="p-2">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile hamburger drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div
            className="bg-white w-64 h-full p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base font-bold text-primary-700">NutriCounsel</h1>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}

              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Shop Management</p>
                  {shopManagementLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/admin/shop'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                          isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                        }`
                      }
                    >
                      <Icon size={18} />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-6 pb-20 md:pb-6 px-4 md:px-8 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1">{children}</div>
        <Newsletter />
        <Footer />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex justify-around py-2">
        {bottomNavLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] px-2 ${
                isActive ? 'text-primary-700' : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} />
            {label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
