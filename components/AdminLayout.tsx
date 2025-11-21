
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { auth } from '../firebase';
import { LayoutDashboard, Package, Image as ImageIcon, LogOut, Settings, FileText, Store, ShoppingBag, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from './ui/ConfirmationModal';

export const AdminLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await auth.signOut();
      logout();
      toast.success("Logged out successfully");
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      setIsLogoutConfirmOpen(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Banners', path: '/admin/banners', icon: <ImageIcon size={20} /> },
    { name: 'Content', path: '/admin/content', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  // Calculate current page title for mobile header
  const currentItem = menuItems.find(item => 
    item.path === '/admin' 
      ? location.pathname === '/admin'
      : location.pathname.startsWith(item.path)
  );
  const pageTitle = currentItem ? currentItem.name : 'Admin Panel';

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col z-30 sticky top-0 h-screen">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-brand-600 flex items-center gap-2">
            🛠 Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? 'bg-brand-50 text-brand-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2">
          {/* Visit Store Link */}
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors font-medium"
          >
            <Store size={20} />
            Visit Store
          </Link>

          <button 
            onClick={handleLogoutClick}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white p-4 shadow-sm z-20 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
             <button 
               onClick={toggleMobileMenu} 
               className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded focus:outline-none"
             >
                <Menu size={24} />
             </button>
             <span className="font-bold text-brand-600 text-lg">{pageTitle}</span>
          </div>
          
          {/* Quick Actions (Mobile Header Right) */}
          <div className="flex gap-2">
             <Link to="/" className="p-2 text-brand-600 hover:bg-brand-50 rounded-full" title="Visit Store">
               <Store size={20} />
             </Link>
          </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Sidebar Panel */}
          <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
             <div className="p-4 border-b flex justify-between items-center h-16">
               <h1 className="text-xl font-bold text-brand-600 flex items-center gap-2">
                 🛠 Admin Panel
               </h1>
               <button 
                 onClick={() => setIsMobileMenuOpen(false)} 
                 className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
               >
                 <X size={24} />
               </button>
             </div>

             <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                      ? 'bg-brand-50 text-brand-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t space-y-2 bg-gray-50">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-brand-600 hover:bg-white rounded-lg transition-colors font-medium"
              >
                <Store size={20} />
                Visit Store
              </Link>

              <button 
                onClick={handleLogoutClick}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout of the admin panel?"
        confirmText="Logout"
        variant="danger"
      />
    </div>
  );
};
