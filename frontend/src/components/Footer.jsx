import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowUp, Leaf } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Services', to: '/dashboard' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    heading: 'Nutrition',
    links: [
      { label: 'Nutrition Articles', to: '/articles' },
      { label: 'Appointments', to: '/appointments' },
      { label: 'BMI Calculator', to: '/bmi-calculator' },
      { label: 'Energy Calculator', to: '/tools' },
      { label: 'Shop', to: '/shop' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'FAQs', to: '/faqs' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
    ],
  },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-white border-t border-gray-100 mt-16 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Leaf size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-800">NutriCounsel</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-xs">
              Personalized nutrition counselling, BMI tracking, and premium wellness supplements —
              helping you build healthier habits, one step at a time.
            </p>
            <div className="space-y-1.5 text-sm text-gray-500">
              <p className="flex items-center gap-2"><Phone size={14} /> +254 700 000 000</p>
              <p className="flex items-center gap-2"><Mail size={14} /> hello@nutricounsel.co.ke</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> Nairobi, Kenya</p>
            </div>
            <div className="flex gap-3 mt-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary-600 hover:text-white transition-colors"
                  aria-label="Social media link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} NutriCounsel. All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
          >
            Back to top <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
