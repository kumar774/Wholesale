
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Save, Settings as SettingsIcon, Image as ImageIcon, UploadCloud, LayoutTemplate, Link as LinkIcon, Plus, Trash2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreSettings, CONSTANTS } from '../../types';

// Helper to convert file to Base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: CONSTANTS.STORE_NAME,
    logoUrl: '',
    whatsappNumber: CONSTANTS.WHATSAPP_NUMBER,
    currencySymbol: CONSTANTS.CURRENCY,
    taxRate: 0,
    address: '',
    footer: {
      aboutText: '',
      copyrightText: '',
      bgColor: '#111827',
      textColor: '#ffffff',
      quickLinks: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Logo Upload State
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Quick Link Edit State
  const [linkInput, setLinkInput] = useState({ name: '', path: '' });
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const doc = await db.collection('settings').doc('general').get();
        if (doc.exists) {
          const data = doc.data() as StoreSettings;
          // Ensure footer object exists in state even if missing in DB
          setSettings({
            ...data,
            footer: {
              aboutText: data.footer?.aboutText || 'Providing fresh, organic, and locally sourced vegetables.',
              copyrightText: data.footer?.copyrightText || `© ${new Date().getFullYear()} ${data.storeName || CONSTANTS.STORE_NAME}. All rights reserved.`,
              bgColor: data.footer?.bgColor || '#111827',
              textColor: data.footer?.textColor || '#ffffff',
              quickLinks: data.footer?.quickLinks || [
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Terms & Conditions', path: '/terms' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Admin Login', path: '/admin/login' }
              ]
            }
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        // Don't toast for fetch error to avoid annoying users if rules are strict
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      let logoUrl = settings.logoUrl;

      // Handle Logo Upload via Base64
      if (logoFile) {
        if (logoFile.size > 700 * 1024) {
           throw new Error("Logo file too large. Please use an image under 700KB.");
        }
        logoUrl = await convertToBase64(logoFile);
      }

      const updatedSettings = {
        ...settings,
        logoUrl
      };

      await db.collection('settings').doc('general').set(updatedSettings, { merge: true });
      setSettings(updatedSettings); // Update local state with new URL
      setLogoFile(null); // Clear file selection
      
      toast.success("Settings saved successfully!");
      setIsConfirmOpen(false);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      if (error.code === 'permission-denied') {
         toast.error("Permission Denied. Please check your Firestore Rules.");
      } else {
         toast.error("Failed to save settings: " + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Quick Links Handlers
  const handleAddLink = () => {
    if (!linkInput.name || !linkInput.path) {
      toast.error("Please enter both Name and Link Path");
      return;
    }

    const currentLinks = settings.footer.quickLinks || [];
    let newLinks = [...currentLinks];

    if (editingLinkIndex !== null) {
      // Update existing
      newLinks[editingLinkIndex] = linkInput;
      setEditingLinkIndex(null);
    } else {
      // Add new
      newLinks.push(linkInput);
    }

    setSettings({
      ...settings,
      footer: { ...settings.footer, quickLinks: newLinks }
    });
    setLinkInput({ name: '', path: '' });
  };

  const handleEditLink = (index: number) => {
    const link = settings.footer.quickLinks[index];
    setLinkInput(link);
    setEditingLinkIndex(index);
  };

  const handleDeleteLink = (index: number) => {
    const newLinks = settings.footer.quickLinks.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      footer: { ...settings.footer, quickLinks: newLinks }
    });
    if (editingLinkIndex === index) {
        setEditingLinkIndex(null);
        setLinkInput({ name: '', path: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingLinkIndex(null);
    setLinkInput({ name: '', path: '' });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
            <SettingsIcon size={28} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>
            <p className="text-sm text-gray-500">Manage global configuration for your store.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSaveClick} className="space-y-8">
          
          {/* General Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div>
             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Store Branding</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative h-32 flex items-center justify-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => e.target.files && setLogoFile(e.target.files[0])} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                      <UploadCloud size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {logoFile ? logoFile.name : "Click to upload logo (Max 700KB)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                   {(logoFile || settings.logoUrl) ? (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-2">Current Preview</p>
                        <div className="border p-2 rounded bg-gray-50 inline-block">
                          <img 
                            src={logoFile ? URL.createObjectURL(logoFile) : settings.logoUrl} 
                            alt="Logo Preview" 
                            className="h-20 w-auto object-contain" 
                          />
                        </div>
                      </div>
                   ) : (
                     <div className="text-center text-gray-400">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No logo set</p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (No + symbol)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="e.g. 919876543210"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 91 for India).</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default VAT/GST (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                 <textarea 
                   rows={3}
                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                   value={settings.address}
                   onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                   placeholder="Enter full store address..."
                 />
              </div>
            </div>
          </div>

          {/* Footer Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
               <LayoutTemplate size={20} /> Footer Configuration
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                       type="color" 
                       value={settings.footer?.bgColor || '#111827'}
                       onChange={(e) => setSettings({ 
                         ...settings, 
                         footer: { ...settings.footer, bgColor: e.target.value } 
                       })}
                       className="h-10 w-10 p-0.5 rounded border cursor-pointer"
                    />
                    <input 
                       type="text" 
                       value={settings.footer?.bgColor || '#111827'}
                       onChange={(e) => setSettings({ 
                         ...settings, 
                         footer: { ...settings.footer, bgColor: e.target.value } 
                       })}
                       className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                       type="color" 
                       value={settings.footer?.textColor || '#ffffff'}
                       onChange={(e) => setSettings({ 
                         ...settings, 
                         footer: { ...settings.footer, textColor: e.target.value } 
                       })}
                       className="h-10 w-10 p-0.5 rounded border cursor-pointer"
                    />
                    <input 
                       type="text" 
                       value={settings.footer?.textColor || '#ffffff'}
                       onChange={(e) => setSettings({ 
                         ...settings, 
                         footer: { ...settings.footer, textColor: e.target.value } 
                       })}
                       className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Footer "About" Text</label>
                 <textarea 
                   rows={3}
                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                   value={settings.footer?.aboutText || ''}
                   onChange={(e) => setSettings({ 
                      ...settings, 
                      footer: { ...settings.footer, aboutText: e.target.value } 
                   })}
                   placeholder="Enter short description about the store..."
                 />
              </div>

              {/* Quick Links Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <LinkIcon size={16} /> Quick Links Menu
                </h4>
                
                {/* Links List */}
                <div className="mb-4 space-y-2">
                   {settings.footer?.quickLinks?.length === 0 && (
                     <p className="text-sm text-gray-400 italic">No links added yet.</p>
                   )}
                   {settings.footer?.quickLinks?.map((link, idx) => (
                     <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm">
                        <div>
                           <span className="font-medium text-gray-800 block">{link.name}</span>
                           <span className="text-xs text-gray-500 block">{link.path}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => handleEditLink(idx)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteLink(idx)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Add/Edit Input */}
                <div className="bg-white p-3 rounded border border-gray-200">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                     {editingLinkIndex !== null ? 'Edit Link' : 'Add New Link'}
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input 
                        type="text" 
                        placeholder="Menu Name (e.g. Home)" 
                        className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={linkInput.name}
                        onChange={(e) => setLinkInput({ ...linkInput, name: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Link Path (e.g. /about or https://...)" 
                        className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={linkInput.path}
                        onChange={(e) => setLinkInput({ ...linkInput, path: e.target.value })}
                      />
                   </div>
                   <div className="flex gap-2">
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddLink}
                        variant={editingLinkIndex !== null ? 'primary' : 'outline'}
                        className={editingLinkIndex === null ? "border-dashed border-gray-400 text-gray-600 hover:border-brand-500 hover:text-brand-600" : ""}
                      >
                         {editingLinkIndex !== null ? (
                           <><Save size={14} className="mr-1"/> Update Link</>
                         ) : (
                           <><Plus size={14} className="mr-1"/> Add to Menu</>
                         )}
                      </Button>
                      {editingLinkIndex !== null && (
                        <Button type="button" size="sm" variant="ghost" onClick={handleCancelEdit}>
                           <X size={14} className="mr-1"/> Cancel
                        </Button>
                      )}
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  value={settings.footer?.copyrightText || ''}
                  onChange={(e) => setSettings({ 
                      ...settings, 
                      footer: { ...settings.footer, copyrightText: e.target.value } 
                  })}
                  placeholder="© 2023 Store Name. All rights reserved."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <Button type="submit" isLoading={saving} className="gap-2 px-6">
              <Save size={18} />
              Save Configuration
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        title="Save Settings"
        message="Are you sure you want to update the store settings? These changes will apply immediately."
        variant="info"
        isLoading={saving}
      />
    </div>
  );
};
