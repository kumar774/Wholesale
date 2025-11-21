import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Plus, Trash2, Edit, X, Download, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/errorHandler';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    pricePerKg: 0,
    unit: 'kg',
    category: 'Vegetables',
    description: '',
    featured: false,
    inStock: true,
    stockQuantity: 100,
    lowStockThreshold: 10,
    images: []
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false); // Kept for button state
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const snap = await db.collection('products').orderBy('createdAt', 'desc').get();
      const list = snap.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data,
          images: Array.isArray(data.images) ? data.images : [] 
        } as Product;
      });
      setProducts(list);
      setSelectedIds([]); // Clear selection on refresh
    } catch (error: any) {
      console.error(error);
      // Use utility but customized title
      toast.error(`Failed to load products: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkConfirmOpen(false);
    setActionLoading(true);

    const bulkDeleteOperation = async () => {
      const deletePromises = selectedIds.map(id => db.collection('products').doc(id).delete());
      await Promise.all(deletePromises);
    };

    await toast.promise(bulkDeleteOperation(), {
      loading: `Deleting ${selectedIds.length} products...`,
      success: 'Products deleted successfully!',
      error: (err) => getErrorMessage(err)
    });

    setActionLoading(false);
    setSelectedIds([]);
    fetchProducts();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const saveOperation = async () => {
      let imageUrl = editingProduct?.images?.[0] || '';

      if (imageFile) {
        const storageRef = storage.ref(`products/${Date.now()}_${imageFile.name}`);
        const snapshot = await storageRef.put(imageFile);
        imageUrl = await snapshot.ref.getDownloadURL();
      }

      const productData = {
        ...formData,
        slug: formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        images: imageUrl ? [imageUrl] : [],
        stockQuantity: Number(formData.stockQuantity) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 0,
        updatedAt: new Date(),
      };

      if (editingProduct) {
        await db.collection('products').doc(editingProduct.id).update(productData);
      } else {
        await db.collection('products').add({
          ...productData,
          createdAt: new Date()
        });
      }
    };

    await toast.promise(saveOperation(), {
      loading: editingProduct ? 'Updating product...' : 'Creating product...',
      success: editingProduct ? 'Product updated successfully!' : 'Product added successfully!',
      error: (err) => getErrorMessage(err)
    });

    setUploading(false);
    setIsProductModalOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleToggleStock = async (product: Product) => {
    const newStatus = !product.inStock;
    
    const updateOp = async () => {
        await db.collection('products').doc(product.id).update({
            inStock: newStatus,
            updatedAt: new Date()
        });
    };

    await toast.promise(updateOp(), {
        loading: 'Updating status...',
        success: `Product marked as ${newStatus ? 'In Stock' : 'Out of Stock'}`,
        error: (err) => getErrorMessage(err)
    });
    
    fetchProducts();
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);

    const deleteOperation = async () => {
      await db.collection('products').doc(deleteId).delete();
    };

    await toast.promise(deleteOperation(), {
      loading: 'Deleting product...',
      success: 'Product deleted successfully!',
      error: (err) => getErrorMessage(err)
    });

    setActionLoading(false);
    setDeleteId(null);
    fetchProducts();
  };

  const handleSeedData = async () => {
    setIsImportConfirmOpen(false);
    
    const seedOperation = async () => {
      const getRandomPrice = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
      const getRandomStock = () => Math.floor(Math.random() * 100);

      const sampleProducts = [
        {
          name: "Red Onion (Nasik)",
          category: "Vegetables",
          pricePerKg: getRandomPrice(30, 80),
          unit: "kg",
          description: "Fresh, organic red onions sourced directly from Nasik farms. Perfect for salads and cooking.",
          images: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80"],
          featured: true
        },
        {
          name: "Potato (Jyoti)",
          category: "Vegetables",
          pricePerKg: getRandomPrice(20, 45),
          unit: "kg",
          description: "Premium quality Jyoti potatoes. Starchy and perfect for fries, curries, and baking.",
          images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80"],
          featured: false
        },
        {
          name: "Garlic (Desi)",
          category: "Vegetables",
          pricePerKg: getRandomPrice(120, 250),
          unit: "kg",
          description: "Strong flavored Desi Garlic. Essential for Indian cooking and medicinal benefits.",
          images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"],
          featured: false
        },
        {
          name: "Ginger (Adrak)",
          category: "Vegetables",
          pricePerKg: getRandomPrice(80, 150),
          unit: "kg",
          description: "Fresh, washed Ginger root. Adds zest and spice to tea and dishes.",
          images: ["https://images.unsplash.com/photo-1615485500704-8e99099928b3?auto=format&fit=crop&w=600&q=80"],
          featured: false
        },
        {
          name: "Tomato (Hybrid)",
          category: "Vegetables",
          pricePerKg: getRandomPrice(25, 60),
          unit: "kg",
          description: "Juicy, red hybrid tomatoes. Great for curries, sauces, and salads.",
          images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"],
          featured: true
        },
        {
          name: "Tamarind (Imli)",
          category: "Exotic",
          pricePerKg: getRandomPrice(150, 300),
          unit: "kg",
          description: "Tangy and sweet natural Tamarind pods. Used in chutneys and sambar.",
          images: ["https://images.unsplash.com/photo-1606923829579-560223742fbc?auto=format&fit=crop&w=600&q=80"],
          featured: false
        },
        {
          name: "Dry Red Chili (Teja)",
          category: "Spices",
          pricePerKg: getRandomPrice(200, 400),
          unit: "kg",
          description: "Spicy Guntur Teja dry red chilies. Adds high heat to your dishes.",
          images: ["https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=600&q=80"],
          featured: false
        },
        {
          name: "Kashmiri Red Chili",
          category: "Spices",
          pricePerKg: getRandomPrice(300, 500),
          unit: "kg",
          description: "Vibrant red Kashmiri chilies. Known for great color and mild heat.",
          images: ["https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80"],
          featured: true
        },
        {
          name: "Green Chili (Spicy)",
          category: "Vegetables",
          pricePerKg: getRandomPrice(60, 100),
          unit: "kg",
          description: "Fresh spicy green chilies. A staple for every Indian kitchen.",
          images: ["https://images.unsplash.com/photo-1563911892437-1e59bd4e4111?auto=format&fit=crop&w=600&q=80"],
          featured: false
        },
        {
          name: "Carrot (Ooty)",
          category: "Vegetables",
          pricePerKg: getRandomPrice(40, 90),
          unit: "kg",
          description: "Sweet and crunchy Ooty carrots. Rich in Vitamin A.",
          images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"],
          featured: false
        },
        {
          name: "Cabbage",
          category: "Vegetables",
          pricePerKg: getRandomPrice(20, 50),
          unit: "kg",
          description: "Fresh green cabbage. Perfect for stir-fry and stuffing.",
          images: ["https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=600&q=80"],
          featured: false
        }
      ];

      const batch = db.batch();
      
      sampleProducts.forEach((p) => {
        const newDocRef = db.collection('products').doc();
        batch.set(newDocRef, {
          ...p,
          slug: p.name.toLowerCase().replace(/\s+/g, '-'),
          inStock: true,
          stockQuantity: getRandomStock(),
          lowStockThreshold: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await batch.commit();
    };

    await toast.promise(seedOperation(), {
      loading: 'Importing sample data...',
      success: 'Sample products imported!',
      error: (err) => getErrorMessage(err)
    });

    fetchProducts();
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
        ...p,
        stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 100,
        lowStockThreshold: p.lowStockThreshold !== undefined ? p.lowStockThreshold : 10,
    });
    setIsProductModalOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImageFile(null);
    setFormData({
        name: '',
        pricePerKg: 0,
        unit: 'kg',
        category: 'Vegetables',
        description: '',
        featured: false,
        inStock: true,
        stockQuantity: 100,
        lowStockThreshold: 10,
        images: []
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} products found</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
             <Button 
                variant="danger" 
                onClick={() => setIsBulkConfirmOpen(true)} 
                className="gap-2 shadow-sm"
              >
                <Trash2 size={18} /> Delete Selected ({selectedIds.length})
             </Button>
          )}

          <Button variant="outline" onClick={() => setIsImportConfirmOpen(true)} className="gap-2 border-brand-200 text-brand-700 hover:bg-brand-50">
            <Download size={18} /> Import Demo Data
          </Button>
          <Button onClick={() => { resetForm(); setIsProductModalOpen(true); }} className="gap-2">
            <Plus size={18} /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="relative w-full sm:w-64">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
             <select 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
             >
                <option value="All">All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Spices">Spices</option>
                <option value="Exotic">Exotic</option>
             </select>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 w-12">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                 <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
              ) : filteredProducts.map((p) => {
                 const img = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/40';
                 const isSelected = selectedIds.includes(p.id);
                 const isLowStock = (p.stockQuantity || 0) <= (p.lowStockThreshold || 10);
                 
                 return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-brand-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelection(p.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <img src={img} className="h-10 w-10 rounded object-cover" alt="" />
                    </td>
                    <td className="px-6 py-4 font-medium">
                        {p.name} 
                        <div className="text-xs text-gray-400">{p.category}</div>
                    </td>
                    <td className="px-6 py-4">₹{p.pricePerKg}/{p.unit}</td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                             {p.stockQuantity || 0}
                           </span>
                           <span className="text-[10px] text-gray-400">Low &lt; {p.lowStockThreshold || 0}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => handleToggleStock(p)}
                              title="Toggle Stock Status"
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${p.inStock ? 'bg-green-500' : 'bg-gray-200'}`}
                           >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${p.inStock ? 'translate-x-6' : 'translate-x-1'}`} />
                           </button>
                           <span className={`text-xs font-medium ${p.inStock ? 'text-green-600' : 'text-gray-500'}`}>
                             {p.inStock ? 'Active' : 'Hidden'}
                           </span>
                        </div>
                        {p.featured && <div className="mt-1"><span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Featured</span></div>}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => startEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                      <button onClick={() => confirmDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                 );
              })}
              {filteredProducts.length === 0 && !isLoading && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="mb-2 text-gray-300" />
                        <p>No products match your filters.</p>
                        {products.length === 0 && <p className="text-sm mt-2">Click 'Import Demo Data' to start.</p>}
                    </div>
                  </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setIsProductModalOpen(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Price</label>
                    <input type="number" required className="input-field" value={formData.pricePerKg} onChange={e => setFormData({...formData, pricePerKg: parseFloat(e.target.value)})} />
                </div>
                <div>
                    <label className="label">Unit (e.g., kg, pc, dozen)</label>
                    <input type="text" required className="input-field" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                    <label className="label text-xs">Stock Quantity</label>
                    <input 
                        type="number" 
                        min="0"
                        className="input-field text-sm" 
                        value={formData.stockQuantity} 
                        onChange={e => setFormData({...formData, stockQuantity: parseFloat(e.target.value)})} 
                    />
                </div>
                <div>
                    <label className="label text-xs">Low Stock Alert At</label>
                    <input 
                        type="number" 
                        min="0"
                        className="input-field text-sm" 
                        value={formData.lowStockThreshold} 
                        onChange={e => setFormData({...formData, lowStockThreshold: parseFloat(e.target.value)})} 
                    />
                </div>
              </div>

              <div>
                <label className="label">Category</label>
                <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Spices">Spices</option>
                    <option value="Exotic">Exotic</option>
                </select>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea className="input-field" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="flex gap-4">
                 <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                 </label>
                 <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700">Show in Store</span>
                 </label>
              </div>

              <div>
                <label className="label">Image</label>
                <input type="file" accept="image/*" onChange={e => e.target.files && setImageFile(e.target.files[0])} className="text-sm" />
                {formData.images?.[0] && !imageFile && (
                    <img src={formData.images[0]} alt="Preview" className="h-20 w-20 object-cover mt-2 rounded" />
                )}
              </div>

              <Button type="submit" className="w-full mt-4" isLoading={uploading}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        isLoading={actionLoading}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.length} Products`}
        message={`Are you sure you want to delete ${selectedIds.length} selected products? This action cannot be undone.`}
        isLoading={actionLoading}
      />

      {/* Import Confirmation Modal */}
      <ConfirmationModal
        isOpen={isImportConfirmOpen}
        onClose={() => setIsImportConfirmOpen(false)}
        onConfirm={handleSeedData}
        title="Import Demo Data"
        message="This will add sample vegetables to your inventory with random stock levels."
        variant="info"
        confirmText="Import"
        isLoading={isLoading && !uploading} // Use main loading state during import
      />

      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input-field { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #16a34a; ring: 2px solid #16a34a; }
      `}</style>
    </div>
  );
};
