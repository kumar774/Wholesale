import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
            
            <div className="prose prose-lg text-gray-600">
                <p className="mb-4">
                    At VegitableWholesale, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website.
                </p>

                <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">Information We Collect</h3>
                <p className="mb-4">
                    We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you choose to participate in various activities related to the Site, such as placing orders via WhatsApp.</li>
                    <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">Use of Your Information</h3>
                <p className="mb-4">
                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li>Process your orders and deliver products.</li>
                    <li>Send you information regarding your order or other products and services.</li>
                    <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                    <li>Improve our website and customer service.</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">Data Security</h3>
                <p className="mb-4">
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>

                <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">Contact Us</h3>
                <p>
                    If you have questions or comments about this Privacy Policy, please contact us at contact@vegwholesale.com.
                </p>
            </div>
        </div>
    </div>
  );
};