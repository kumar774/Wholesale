
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { auth } from '../firebase';
import { LayoutDashboard, Package, Image as ImageIcon, LogOut, Settings, FileText, Store, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from './ui/ConfirmationModal';

export const AdminLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogoutClick = () => {
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

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col z-10">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-brand-600 flex items-center gap-2">
            🛠 Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
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

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden absolute top-0 left-0 w-full bg-white p-4 shadow-sm z-20 flex justify-between items-center">
          <span className="font-bold text-brand-600 text-lg">{pageTitle}</span>
          <div className="flex gap-4">
             <Link to="/" className="text-sm text-brand-600 font-medium">Store</Link>
             <button onClick={handleLogoutClick} className="text-sm text-red-600">Logout</button>
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
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
