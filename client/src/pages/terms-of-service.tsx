import { Helmet } from "react-helmet-async";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Terms of Service - DapsiWow</title>
        <meta name="description" content="Terms of Service for DapsiWow online tools platform" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to DapsiWow. These Terms of Service govern your use of our online tools platform.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing and using DapsiWow, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Use of Our Tools</h2>
            <p className="text-gray-600 mb-4">
              Our tools are provided free of charge for legitimate purposes. You agree to:
            </p>
            <ul className="list-disc ml-6 text-gray-600 mb-6">
              <li>Use the tools responsibly and ethically</li>
              <li>Not attempt to reverse engineer or copy our tools</li>
              <li>Not use the tools for illegal or harmful activities</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              DapsiWow tools are provided "as is" without any warranties. We are not responsible for any damages that may arise from the use of our tools.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us through our contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}