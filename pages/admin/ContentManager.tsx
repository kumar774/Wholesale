
import React from 'react';
import { FileText, Edit, ArrowRight, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContentManager: React.FC = () => {
  const pages = [
    { id: 'about', title: 'About Us', description: 'Company history, mission, and values.' },
    { id: 'terms', title: 'Terms & Conditions', description: 'Usage rules, disclaimers, and legal terms.' },
    { id: 'privacy', title: 'Privacy Policy', description: 'Data collection and usage policies.' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <FileText size={28} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Content Manager</h1>
            <p className="text-sm text-gray-500">Manage content for static pages and sections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pages.map(page => (
          <Link 
            key={page.id}
            to={`/admin/content/edit/${page.id}`}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                <Layout size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{page.title}</h3>
                <p className="text-gray-500 text-sm">{page.description}</p>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-orange-600 transition-colors">
               <Edit size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
