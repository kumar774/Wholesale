
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductManager } from './pages/admin/ProductManager';
import { BannerManager } from './pages/admin/BannerManager';
import { OrderList } from './pages/admin/OrderList';
import { Settings } from './pages/admin/Settings';
import { ContentManager } from './pages/admin/ContentManager';
import { ContentEditor } from './pages/admin/ContentEditor';
import { AdminLayout } from './components/AdminLayout';
import { useAuthStore, useSettingsStore } from './store';
import { db } from './firebase';

// Protected Route Component
const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

// Public Layout Wrapper
const PublicLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
    <BottomNav />
  </div>
);

const App: React.FC = () => {
  const { settings, setSettings } = useSettingsStore();

  useEffect(() => {
    const unsubscribe = db.collection('settings').doc('general').onSnapshot({
      next: (doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            setSettings(data as any);
          }
        }
      },
      error: (error) => {
        // Suppress permission-denied errors for public users if rules are strict
        if (error.code === 'permission-denied') {
          console.warn("Settings: Permission denied. Using default local settings.");
        } else {
          console.error("Error fetching settings:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [setSettings]);

  // Update browser tab title when store name changes
  useEffect(() => {
    if (settings.storeName) {
      document.title = `${settings.storeName} - Fresh & Organic`;
    }
  }, [settings.storeName]);

  return (
    <HashRouter>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          className: 'text-sm font-medium shadow-lg',
          style: {
            background: '#333',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#F0FDF4', // brand-50
              color: '#15803D', // brand-700
              border: '1px solid #BBF7D0',
            },
            iconTheme: {
              primary: '#22C55E',
              secondary: '#F0FDF4',
            },
          },
          error: {
            style: {
              background: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FECACA',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FEF2F2',
            },
          },
          loading: {
             style: {
              background: '#F3F4F6',
              color: '#1F2937',
              border: '1px solid #E5E7EB',
            },
          }
        }} 
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><div className="p-12 text-center">Terms and Conditions Placehoder</div></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
        
        {/* Admin Auth */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="banners" element={<BannerManager />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="content/edit/:pageId" element={<ContentEditor />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="h-screen flex items-center justify-center text-2xl text-gray-400">404 - Page Not Found</div>} />
      </Routes>
    </HashRouter>
  );
};

export default App;
