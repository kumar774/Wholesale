import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { db } from '../firebase';

export const About: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
        try {
            const doc = await db.collection('content').doc('about').get();
            if (doc.exists && doc.data()?.html) {
                setContent(doc.data()?.html);
            }
        } catch (err) {
            console.error("Error fetching about content:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchContent();
  }, []);

  const DefaultContent = () => (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">About VegitableWholesale</h1>
        
        <div className="prose prose-lg text-gray-600">
            <p className="mb-4">
                Welcome to VegitableWholesale, your number one source for fresh, organic, and locally sourced vegetables. We are dedicated to providing you with the very best produce, with an emphasis on quality, competitive pricing, and reliable delivery.
            </p>

            <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">Our Mission</h3>
            <p className="mb-4">
                Founded in 2023, VegitableWholesale has come a long way from its beginnings. When we first started out, our passion for "Farm to Fork" drove us to start this business so that we can offer you the freshest vegetables at wholesale rates.
            </p>

            <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">Why Choose Us?</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Direct sourcing from farmers</li>
                <li>Quality checks at every stage</li>
                <li>Competitive wholesale pricing</li>
                <li>Timely delivery for your business needs</li>
            </ul>

            <p>
                We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
            </p>

            <p className="mt-8 font-semibold text-brand-600">
                Sincerely,<br/>
                The VegitableWholesale Team
            </p>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 relative group">
        {isAuthenticated && (
            <Link 
                to="/admin/content/edit/about" 
                className="absolute top-4 right-4 md:top-16 md:right-0 bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:bg-brand-700 transition-all z-10 opacity-80 hover:opacity-100"
            >
                <Edit size={16} /> <span className="hidden sm:inline">Edit Content</span>
            </Link>
        )}

        {loading ? (
             <div className="space-y-4 animate-pulse bg-white p-12 rounded-2xl">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
             </div>
        ) : content ? (
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                 <div className="prose prose-lg max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        ) : (
            <DefaultContent />
        )}
    </div>
  );
};