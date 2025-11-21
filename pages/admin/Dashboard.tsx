import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Activity, AlertTriangle, ArrowRight, CheckSquare } from 'lucide-react';
import { CONSTANTS, Product } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    admins: 0,
    revenue: 0,
    aov: 0
  });
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const pSnap = await db.collection('products').get();
        const oSnap = await db.collection('orders').get();
        const aSnap = await db.collection('admins').get();

        const products = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const orders = oSnap.docs.map(doc => doc.data());
        
        // Calculate Low Stock
        const lowStock = products.filter(p => {
            const qty = p.stockQuantity || 0;
            const thresh = p.lowStockThreshold !== undefined ? p.lowStockThreshold : 10;
            return qty <= thresh;
        });
        setLowStockItems(lowStock);

        // Calculate Financials
        const totalRevenue = orders.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        // Prepare Chart Data (Last 7 Days)
        const last7Days = new Map();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          // Key format YYYY-MM-DD for matching
          const key = d.toISOString().split('T')[0];
          // Display format "Oct 12"
          const name = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          last7Days.set(key, { name, revenue: 0, orders: 0 });
        }

        orders.forEach(order => {
          if (order.createdAt) {
            // Handle Firestore Timestamp or Date string
            const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            const key = date.toISOString().split('T')[0];
            
            if (last7Days.has(key)) {
              const entry = last7Days.get(key);
              entry.revenue += (Number(order.totalAmount) || 0);
              entry.orders += 1;
            }
          }
        });

        setChartData(Array.from(last7Days.values()));

        setStats({
          products: pSnap.size,
          orders: oSnap.size,
          admins: aSnap.size || 1,
          revenue: totalRevenue,
          aov: avgOrderValue
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard analytics...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
      <p className="text-gray-500 mb-8">Welcome back! Here's what's happening with your store today.</p>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {CONSTANTS.CURRENCY}{stats.revenue.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.orders}</h3>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg. Order Value</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {CONSTANTS.CURRENCY}{Math.round(stats.aov).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.products}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-600" />
                Revenue (Last 7 Days)
            </h2>
            </div>
            
            <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-500" />
                    Low Stock Alerts
                </h2>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    {lowStockItems.length}
                </span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 max-h-[280px] pr-2">
                {lowStockItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="bg-green-50 p-3 rounded-full mb-2">
                           <CheckSquare size={24} className="text-green-500" />
                        </div>
                        <p className="text-sm">All items well stocked!</p>
                    </div>
                ) : (
                    lowStockItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-red-100 overflow-hidden">
                                    <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                                    <p className="text-xs text-red-600 font-medium">
                                        Stock: {item.stockQuantity || 0} <span className="text-gray-400">/ {item.lowStockThreshold || 0}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <Link to="/admin/products" className="mt-4 block">
                <button className="w-full py-2 text-sm text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                    Manage Inventory
                </button>
            </Link>
        </div>
      </div>
    </div>
  );
};