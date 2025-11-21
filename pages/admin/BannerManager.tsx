
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { Banner } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Plus, Trash2, Edit, X, Image as ImageIcon, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to convert file to Base64 string
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    ctaUrl: '/',
    order: 1,
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const snap = await db.collection('banners').orderBy('order', 'asc').get();
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
      setBanners(list);
    } catch (error) {
      console.error(error);
      // Don't toast on fetch error to avoid spam if rules block read for now
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBanner && !imageFile && !formData.imageUrl) {
      toast.error("Please select an image");
      return;
    }

    // Verify Auth
    if (!auth.currentUser) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    setUploading(true);
    const toastId = toast.loading(editingBanner ? 'Updating banner...' : 'Creating banner...');

    try {
      let imageUrl = formData.imageUrl || '';

      // Convert Image to Base64 if new file selected
      if (imageFile) {
        // Check size < 700KB to be safe for Firestore (1MB limit)
        if (imageFile.size > 700 * 1024) {
           throw new Error("Image is too large. Please use an image under 700KB.");
        }
        imageUrl = await convertToBase64(imageFile);
      }

      const bannerData = {
        ...formData,
        imageUrl,
        order: Number(formData.order) || 0,
        updatedAt: new Date(), // Use client-side date to avoid namespace issues
      };

      if (editingBanner) {
        await db.collection('banners').doc(editingBanner.id).update(bannerData);
      } else {
        await db.collection('banners').add({
          ...bannerData,
          createdAt: new Date()
        });
      }

      toast.success(editingBanner ? 'Banner Updated!' : 'Banner Created!', { id: toastId });
      
      setIsModalOpen(false);
      resetForm();
      fetchBanners();

    } catch (error: any) {
      console.error("Banner Operation Failed:", error);
      
      if (error.code === 'permission-denied') {
        toast.error("Permission Denied. Please check your Firestore Rules.", { id: toastId });
      } else {
        toast.error(`Error: ${error.message || "Operation failed"}`, { id: toastId });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    const toastId = toast.loading("Deleting banner...");
    
    try {
      await db.collection('banners').doc(deleteId).delete();
      toast.success("Banner Deleted Successfully!", { id: toastId });
      await fetchBanners();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'permission-denied') {
        toast.error("Permission Denied. Check Firestore Rules.", { id: toastId });
      } else {
        toast.error("Failed to delete: " + error.message, { id: toastId });
      }
    } finally {
      setActionLoading(false);
      setDeleteId(null);
    }
  };

  const startEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setImageFile(null);
    setFormData({
      title: '',
      subtitle: '',
      ctaUrl: '/',
      order: banners.length + 1,
      imageUrl: ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Banner Manager</h2>
            <p className="text-sm text-gray-500">Manage homepage carousel images</p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="gap-2">
          <Plus size={18} /> Add Banner
        </Button>
      </div>

      {/* Banner List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading banners...</div>
        ) : banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
            {/* Image Preview */}
            <div className="w-full md:w-64 h-48 bg-gray-100 relative">
              <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                Order: {banner.order}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 flex-grow flex flex-col justify-center">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{banner.title}</h3>
              <p className="text-gray-500 mb-4">{banner.subtitle}</p>
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-4">
                <ExternalLink size={14} />
                Links to: {banner.ctaUrl}
              </div>
              
              <div className="flex gap-3 mt-auto">
                <Button variant="outline" size="sm" onClick={() => startEdit(banner)} className="gap-2">
                  <Edit size={16} /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(banner.id)} className="gap-2">
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && banners.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No banners yet</h3>
            <p className="text-gray-500">Add your first banner to showcase on the homepage.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingBanner ? 'Edit Banner' : 'New Banner'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Main Heading)</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="e.g. Fresh Vegetables"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="e.g. Direct from Farm"
                  value={formData.subtitle} 
                  onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link URL</label>
                   <input 
                      type="text" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                      value={formData.ctaUrl} 
                      onChange={e => setFormData({...formData, ctaUrl: e.target.value})} 
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                   <input 
                      type="number" 
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                      value={formData.order} 
                      onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => e.target.files && setImageFile(e.target.files[0])} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <ImageIcon size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : "Click to upload image (Max 700KB)"}
                    </span>
                  </div>
                </div>
                
                {(formData.imageUrl || imageFile) && (
                    <div className="mt-3 relative h-32 rounded-lg overflow-hidden bg-gray-100 border">
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                    </div>
                )}
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" isLoading={uploading}>
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        isLoading={actionLoading}
      />
    </div>
  );
};
