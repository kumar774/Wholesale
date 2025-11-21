
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { Order, CONSTANTS } from '../../types';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Trash2, Eye, ShoppingBag, Calendar, Phone, MapPin, Search, X, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(list);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      if (error.code === 'permission-denied') {
         toast.error("Access Denied: Cannot load orders.");
      } else {
         toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customerPhone || '').includes(searchTerm)
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await db.collection('orders').doc(deleteId).delete();
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order");
    } finally {
      setActionLoading(false);
      setDeleteId(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    // Handle Date object or string
    return new Date(timestamp).toLocaleString();
  };

  const openWhatsApp = (order: Order) => {
    if (!order.whatsappMessage) {
        toast.error("No message content stored.");
        return;
    }
    const encodedMessage = encodeURIComponent(order.whatsappMessage);
    const whatsappUrl = `https://wa.me/${CONSTANTS.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <ShoppingBag size={28} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
            <p className="text-sm text-gray-500">Track incoming WhatsApp orders logged from the checkout.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="px-6 py-3 text-xs uppercase">Date</th>
                <th className="px-6 py-3 text-xs uppercase">Customer</th>
                <th className="px-6 py-3 text-xs uppercase">Items</th>
                <th className="px-6 py-3 text-xs uppercase">Total</th>
                <th className="px-6 py-3 text-xs uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No orders found</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{order.customerName || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Phone size={12} /> {order.customerPhone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-600">
                      {CONSTANTS.CURRENCY}{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors mr-2"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(order.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Order Details
                  <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                    ID: {selectedOrder.id.slice(0,8)}...
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                   <ShoppingBag size={16} /> Customer Info
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedOrder.customerName || 'Not provided'}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedOrder.customerPhone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                   <MapPin size={16} /> Delivery Address
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedOrder.customerAddress || 'No address provided'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Items Ordered</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2">Item</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-center">{item.qty} {item.unit}</td>
                        <td className="px-4 py-2 text-right">{CONSTANTS.CURRENCY}{item.pricePerKg}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          {CONSTANTS.CURRENCY}{item.pricePerKg * item.qty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right">Total Amount</td>
                      <td className="px-4 py-3 text-right text-brand-600 text-lg">
                        {CONSTANTS.CURRENCY}{selectedOrder.totalAmount}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

             {/* Generated Message Display */}
             <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                   <MessageCircle size={16} /> Generated Message
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap text-gray-600 border">
                    {selectedOrder.whatsappMessage}
                </div>
             </div>
            
            <div className="flex justify-between items-center border-t pt-4">
               <button 
                 onClick={() => openWhatsApp(selectedOrder)}
                 className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
               >
                 <MessageCircle size={18} /> Open in WhatsApp
               </button>

               <button 
                 onClick={() => setSelectedOrder(null)}
                 className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Order Log"
        message="Are you sure you want to remove this order from the history? This does not affect WhatsApp messages."
        isLoading={actionLoading}
      />
    </div>
  );
};
