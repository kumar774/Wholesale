
import React from 'react';
import { useSettingsStore } from '../store';
import { MapPin, Phone, Mail } from 'lucide-react';

export const Contact: React.FC = () => {
  const { settings } = useSettingsStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold">Get in touch</h2>
          <p className="text-gray-600">
            We are here to help you with your wholesale vegetable needs. Reach out to us for bulk orders, partnership inquiries, or support.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-brand-100 p-3 rounded-full text-brand-600">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Phone / WhatsApp</h3>
                <p className="text-gray-600">+{settings.whatsappNumber}</p>
                <p className="text-sm text-gray-500">Mon - Sat, 8am - 8pm</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="bg-brand-100 p-3 rounded-full text-brand-600">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Email</h3>
                <p className="text-gray-600">contact@vegwholesale.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="bg-brand-100 p-3 rounded-full text-brand-600">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Warehouse Location</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {settings.address || '123 Market Yard, Main Road,\nVegetable City, India 400001'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Embed (Placeholder) */}
        <div className="bg-gray-200 rounded-xl h-[400px] flex items-center justify-center overflow-hidden shadow-inner">
           <iframe 
             title="Map"
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.298954543!2d77.0!3d28.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDAwJzAwLjAiTiA3N8KwMDAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin" 
             width="100%" 
             height="100%" 
             style={{border:0}} 
             loading="lazy"
           ></iframe>
        </div>
      </div>
    </div>
  );
};