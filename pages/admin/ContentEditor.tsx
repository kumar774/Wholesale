
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { Button } from '../../components/ui/Button';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContentEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pageTitles: Record<string, string> = {
    about: 'About Us',
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy'
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (!pageId) return;
      try {
        const doc = await db.collection('content').doc(pageId).get();
        if (doc.exists) {
          setHtml(doc.data()?.html || '');
        } else {
            // If new/empty, we could preload with some default templates if needed
            // For now, leave empty or keep existing state if user navigated here
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pageId]);

  const handleSave = async () => {
    if (!pageId) return;
    setSaving(true);
    try {
      await db.collection('content').doc(pageId).set({
        html,
        updatedAt: new Date()
      }, { merge: true });
      toast.success("Content saved successfully!");
    } catch (error: any) {
      console.error("Error saving content:", error);
      if (error.code === 'permission-denied') {
         toast.error("Permission Denied. Check Firestore Rules.");
      } else {
         toast.error("Failed to save content");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading editor...</div>;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/content')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit: {pageTitles[pageId || ''] || pageId}</h1>
            <p className="text-sm text-gray-500">Editing content for /{pageId}</p>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={saving} className="gap-2">
          <Save size={18} /> Save Changes
        </Button>
      </div>

      <div className="flex-grow bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b text-xs text-gray-500 flex justify-between">
            <span>HTML Editor</span>
            <span>Supports Tailwind CSS classes</span>
        </div>
        <textarea
          className="flex-grow w-full p-4 font-mono text-sm outline-none resize-none"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="Enter HTML content here... <h1>Title</h1><p>Content...</p>"
        />
      </div>
    </div>
  );
};
