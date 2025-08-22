import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Privacy Policy - DapsiWow</title>
        <meta name="description" content="Privacy Policy for DapsiWow online tools platform" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              This Privacy Policy describes how DapsiWow collects, uses, and protects your information when you use our online tools platform.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect minimal information to provide you with the best experience:
            </p>
            <ul className="list-disc ml-6 text-gray-600 mb-6">
              <li>Usage data and analytics to improve our tools</li>
              <li>Browser information for compatibility purposes</li>
              <li>No personal information is stored or collected</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Information</h2>
            <p className="text-gray-600 mb-6">
              The information we collect is used solely to improve our tools and user experience. We do not sell, share, or distribute your information to third parties.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="text-gray-600 mb-6">
              We implement appropriate security measures to protect your information and ensure the integrity of our platform.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us through our contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}