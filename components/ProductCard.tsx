import React, { useState } from 'react';
import { Product } from '../types';
import { useCartStore, useSettingsStore } from '../store';
import { Button } from './ui/Button';
import { Plus, Minus, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [qty, setQty] = useState(1);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const { settings } = useSettingsStore();

  const handleIncrement = () => setQty((prev) => prev + 1);
  const handleDecrement = () => setQty((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addItem(product, qty);
    toast.success(`Added ${qty} ${product.unit} of ${product.name} to cart`);
    setQty(1); // Reset after adding
  };

  const hasMultipleImages = product.images && product.images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    setCurrentImgIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    setCurrentImgIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  // Handle image placeholder if the image url is broken or empty
  const displayImage = (product.images && product.images.length > 0) 
    ? product.images[currentImgIndex] 
    : `https://picsum.photos/400/300?random=${product.id}`;

  return (
    <div className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full ${!product.inStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Carousel Controls */}
        {hasMultipleImages && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <ChevronRight size={20} />
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
              {product.images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 w-1.5 rounded-full shadow-sm transition-colors duration-200 ${
                    idx === currentImgIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {product.featured && product.inStock && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10">
            Featured
          </div>
        )}
        {!product.inStock && (
           <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
             <span className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm transform -rotate-12 border-2 border-white shadow-lg">
               Out of Stock
             </span>
           </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
            <p className="text-gray-500 text-sm">{product.category}</p>
          </div>
          <div className="text-right">
            <span className="block font-bold text-brand-600 text-lg">
              {settings.currencySymbol}{product.pricePerKg}
            </span>
            <span className="text-xs text-gray-400">per {product.unit}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <button 
              onClick={handleDecrement}
              disabled={!product.inStock}
              className="p-2 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-sm font-medium">{qty}</span>
            <button 
              onClick={handleIncrement}
              disabled={!product.inStock}
              className="p-2 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <Button 
            onClick={handleAddToCart} 
            disabled={!product.inStock}
            className={`flex-1 text-sm py-2 gap-2 ${!product.inStock ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`}
          >
            <ShoppingCart size={16} />
            {product.inStock ? 'Add' : 'Sold Out'}
          </Button>
        </div>
      </div>
    </div>
  );
};
