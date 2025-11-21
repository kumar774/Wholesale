
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useSettingsStore } from '../store';

export const Footer: React.FC = () => {
  const { settings } = useSettingsStore();
  
  // Use defaults if settings are not yet loaded or missing
  const footerConfig = settings.footer || {
    aboutText: 'Providing fresh, organic, and locally sourced vegetables directly to wholesalers and restaurants.',
    copyrightText: `© ${new Date().getFullYear()} ${settings.storeName}. All rights reserved.`,
    bgColor: '#111827',
    textColor: '#ffffff',
    quickLinks: []
  };

  // Fallback links if quickLinks is empty or undefined (e.g. during initial load or migration)
  const links = (footerConfig.quickLinks && footerConfig.quickLinks.length > 0) 
    ? footerConfig.quickLinks 
    : [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Admin Login', path: '/admin/login' }
      ];

  return (
    <footer 
      style={{ backgroundColor: footerConfig.bgColor, color: footerConfig.textColor }} 
      className="pt-12 pb-8 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 opacity-90">{settings.storeName}</h3>
            <p className="text-sm leading-relaxed opacity-70 whitespace-pre-line">
              {footerConfig.aboutText}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 opacity-90">Quick Links</h3>
            <ul className="space-y-2 text-sm opacity-70">
              {links.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="hover:underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 opacity-90">Contact Us</h3>
            <ul className="space-y-3 text-sm opacity-70">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>+{settings.whatsappNumber}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>contact@vegwholesale.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span className="whitespace-pre-line">{settings.address || '123 Market Yard, Main Road, Vegetable City, India 400001'}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm opacity-50">
          <p>{footerConfig.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};