import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Phone, User, LayoutDashboard } from 'lucide-react';
import { useCartStore, useAuthStore } from '../store';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const cartCount = useCartStore((state) => state.items?.length || 0);
  const { isAuthenticated } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: <Home size={24} /> 
    },
    { 
      name: 'Cart', 
      path: '/cart', 
      icon: (
        <div className="relative">
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </div>
      ) 
    },
    { 
      name: 'Contact', 
      path: '/contact', 
      icon: <Phone size={24} /> 
    },
    { 
      name: isAuthenticated ? 'Admin' : 'Login', 
      path: isAuthenticated ? '/admin' : '/admin/login', 
      icon: isAuthenticated ? <LayoutDashboard size={24} /> : <User size={24} /> 
    },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] md:hidden z-[100]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-1 flex-col items-center justify-center h-full space-y-1 relative ${
                active 
                  ? 'text-brand-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {active && (
                <span className="absolute top-0 w-1/2 h-0.5 bg-brand-600 rounded-b-md shadow-sm" />
              )}
              <div className={`${active ? '-translate-y-0.5' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-80'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};