
import React, { useState } from 'react';
import { useCartStore, useSettingsStore } from '../store';
import { Button } from '../components/ui/Button';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Trash2, Plus, Minus, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../firebase';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();
  const { settings } = useSettingsStore();
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQtyChange = (id: string, currentQty: number, change: number) => {
    updateQty(id, currentQty + change);
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id);
    toast.success(`${name} removed from cart`);
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    // Simple confirm for clearing entire cart
    if (window.confirm("Are you sure you want to remove all items from your cart?")) {
      clearCart();
      toast.success("Cart cleared");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items || items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    // Open confirmation modal instead of processing immediately
    setIsConfirmOpen(true);
  };

  const processOrder = async () => {
    if (!items || items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);

    // Construct WhatsApp Message
    const itemList = items.map((item, idx) => 
      `${idx + 1}) ${item.name} - ${item.qty} ${item.unit} - ${settings.currencySymbol}${item.pricePerKg}/${item.unit} - ${settings.currencySymbol}${item.pricePerKg * item.qty}`
    ).join('\n');

    const message = `*New Order from ${settings.storeName}* 🥦
---------------------------
*Customer:* ${customerDetails.name || "Not Provided"}
*Phone:* ${customerDetails.phone || "Not Provided"}
*Address:* ${customerDetails.address || "Not Provided"}
---------------------------
*Order Details:*
${itemList}
---------------------------
*Total: ${settings.currencySymbol}${total()}*
---------------------------
Payment: Cash on Delivery / Online (To be confirmed)
Please confirm my order.`;

    try {
      // Log order to Firestore
      await db.collection('orders').add({
        customerName: customerDetails.name || 'Anonymous',
        customerPhone: customerDetails.phone || '',
        customerAddress: customerDetails.address || '',
        items: items,
        totalAmount: total(),
        whatsappMessage: message,
        createdAt: new Date(),
        status: 'new',
        platform: 'web'
      });

      toast.success("Order logged! Opening WhatsApp...");

      // Open WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      // Cleanup
      setIsConfirmOpen(false);
      setCheckoutModalOpen(false);
      clearCart();

    } catch (error: any) {
      console.error("Error logging order:", error);
      
      // Handle Permission Errors (e.g., missing rules) gracefully
      if (error.code === 'permission-denied') {
        console.warn("Database permission denied. Ensure Firestore rules allow 'create' on /orders.");
        // Proceed to WhatsApp anyway, don't show error toast to user
        toast.success("Opening WhatsApp...");
      } else {
        toast.error("Could not log order, but proceeding to WhatsApp.");
      }
      
      // Fallback: Open WhatsApp even if database write fails
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
      setIsConfirmOpen(false);
      setCheckoutModalOpen(false);
      // Optional: Don't clear cart if it failed? Or clear it anyway since they are messaging?
      // Usually better to clear it if they are sending the message.
      clearCart();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <MessageCircle size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any fresh vegetables yet.</p>
        <Link to="/">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemImage = (item.images && item.images.length > 0) 
              ? item.images[0] 
              : `https://picsum.photos/100?random=${item.id}`;
              
            return (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                <img 
                  src={itemImage} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-md"
                />
                
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">{settings.currencySymbol}{item.pricePerKg} per {item.unit}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleQtyChange(item.id, item.qty, -1)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-medium w-12 text-center">{item.qty} {item.unit}</span>
                  <button 
                    onClick={() => handleQtyChange(item.id, item.qty, 1)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="font-bold text-lg">{settings.currencySymbol}{item.pricePerKg * item.qty}</div>
                </div>

                <button 
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
          
          <div className="flex justify-between items-center mt-6">
            <Link to="/">
              <Button variant="outline" size="sm">Continue Shopping</Button>
            </Link>
            <button 
              onClick={handleClearCart}
              className="text-red-500 text-sm hover:underline"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{settings.currencySymbol}{total()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-medium">Free (Wholesale)</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{settings.currencySymbol}{total()}</span>
              </div>
            </div>

            <Button 
              className="w-full flex justify-center items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white" 
              size="lg"
              onClick={() => setCheckoutModalOpen(true)}
            >
              Checkout via WhatsApp <MessageCircle size={20} />
            </Button>
            <p className="text-xs text-center text-gray-500 mt-3">
              You will be redirected to WhatsApp to send your order details.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Delivery Details</h3>
              <button onClick={() => setCheckoutModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="Enter your name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="Enter phone number"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address (Optional)</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="Enter complete address"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E]"
                >
                  Place Order on WhatsApp <ArrowRight size={18} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Final Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={processOrder}
        title="Open WhatsApp?"
        message="This will open WhatsApp to send your order details to our team. Are you ready to proceed?"
        confirmText="Yes, Open WhatsApp"
        variant="info"
        isLoading={isProcessing}
      />
    </div>
  );
};
