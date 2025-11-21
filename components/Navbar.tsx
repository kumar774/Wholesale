import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCartStore, useAuthStore, useSettingsStore } from '../store';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = useCartStore((state) => state.items?.length || 0);
  const { isAuthenticated } = useAuthStore();
  const { settings } = useSettingsStore();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-brand-600 flex items-center gap-2">
              {settings.logoUrl ? (
                 <img src={settings.logoUrl} alt={settings.storeName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <span className="text-3xl">🥬</span>
                  <span className="hidden sm:block">{settings.storeName}</span>
                </>
              )}
              {/* Show text on mobile if no logo, otherwise logic handles it. If logo present, text hidden on mobile by default via above ternary logic for single element, but here we want consistency */}
              {!settings.logoUrl && <span className="sm:hidden">{settings.storeName}</span>}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-gray-600 hover:text-brand-600 font-medium transition-colors ${
                  location.pathname === link.path ? 'text-brand-600' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated && (
              <Link 
                to="/admin" 
                className="text-brand-600 hover:text-brand-800 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Login Button (Desktop) - Show if not authenticated */}
            {!isAuthenticated && (
               <Link to="/admin/login" className="hidden sm:block">
                 <Button size="sm" variant="outline" className="border-brand-200 text-brand-700 hover:bg-brand-50">
                   Login
                 </Button>
               </Link>
            )}

            {/* User / Dashboard Icon (Visible if authenticated) */}
            {isAuthenticated && (
              <Link 
                to="/admin" 
                className="p-2 text-brand-600 hover:text-brand-800 transition-colors"
                title="Dashboard"
              >
                <User size={24} />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-brand-600 transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-brand-600 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
