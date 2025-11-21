import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { Product, Banner } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { ArrowRight, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const categories = ['All', 'Vegetables', 'Fruits', 'Spices', 'Exotic'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Banners using v8 syntax
        const bannerSnap = await db.collection('banners').get();
        const fetchedBanners = bannerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)).sort((a, b) => a.order - b.order);
        setBanners(fetchedBanners.length > 0 ? fetchedBanners : [
          { id: '1', imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1000&auto=format&fit=crop', title: 'Fresh Vegetables', subtitle: 'Direct from Farm', ctaUrl: '/', order: 1 }
        ]);

        // Fetch Products using v8 syntax
        const productSnap = await db.collection('products').get();
        const fetchedProducts = productSnap.docs.map(doc => {
          const data = doc.data();
          // Ensure images is always an array
          return { 
            id: doc.id, 
            ...data,
            images: Array.isArray(data.images) ? data.images : [] 
          } as Product;
        });
        
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Banner Auto-rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  // Filtering Logic
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerKg - b.pricePerKg;
      if (sortBy === 'price-desc') return b.pricePerKg - a.pricePerKg;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-gray-900">
        {loading ? (
          <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-12 w-64 bg-gray-700 rounded mx-auto"></div>
              <div className="h-6 w-48 bg-gray-700 rounded mx-auto"></div>
              <div className="h-12 w-32 bg-gray-700 rounded-full mx-auto mt-8"></div>
            </div>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="absolute inset-0 bg-black/40 z-10"></div>
              <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg tracking-tight">
                  {banner.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-100 mb-8 drop-shadow-md font-light">
                  {banner.subtitle}
                </p>
                <Link to="#products" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                   <Button size="lg" className="rounded-full font-bold shadow-lg">
                    Shop Now <ArrowRight size={20} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Product Grid */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Fresh Produce</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Premium quality wholesale vegetables sourced daily. Best prices guaranteed for bulk orders.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vegetables..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Category Pills (Desktop & Mobile Scrollable) */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto gap-2 hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-brand-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-auto flex items-center gap-2">
               <div className="relative w-full md:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ArrowUpDown size={16} className="text-gray-400" />
                  </div>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="default">Sort by</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
               </div>
            </div>

          </div>
        </div>

        {loading ? (
           // Skeleton Grid
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[...Array(8)].map((_, index) => (
               <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
                 <div className="h-48 bg-gray-200 w-full"></div>
                 <div className="p-4 flex flex-col flex-grow space-y-3">
                   <div className="flex justify-between items-center">
                     <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                     <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                   </div>
                   <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                   <div className="h-12 bg-gray-200 rounded w-full my-2"></div>
                   <div className="mt-auto flex gap-2 pt-2">
                      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-10 bg-gray-200 rounded flex-1"></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🥕</div>
            <h3 className="text-xl font-semibold text-gray-700">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-4 text-brand-600 hover:underline font-medium"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Features/Info Section */}
      <section className="bg-brand-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🚀
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Same day delivery for orders placed before 12 PM.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🌿
              </div>
              <h3 className="text-xl font-bold mb-2">100% Organic</h3>
              <p className="text-gray-600">Certified organic produce from trusted local farmers.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                💰
              </div>
              <h3 className="text-xl font-bold mb-2">Best Wholesale Prices</h3>
              <p className="text-gray-600">Competitive pricing designed for businesses and bulk buyers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};