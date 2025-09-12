
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'fallback'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // EmailJS configuration - these would be set in environment variables
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        // Send email via EmailJS
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: formData.name,
            from_email: formData.email,
            subject: formData.subject,
            message: formData.message,
            to_email: 'saifkhan09@dapsiwow.com'
          },
          publicKey
        );
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        // Fallback: Open default email client with pre-filled information
        const emailSubject = encodeURIComponent(`[DapsiWow Contact] ${formData.subject}`);
        const emailBody = encodeURIComponent(
          `Name: ${formData.name}\n` +
          `Email: ${formData.email}\n` +
          `Subject: ${formData.subject}\n\n` +
          `Message:\n${formData.message}`
        );
        const mailtoLink = `mailto:saifkhan09@dapsiwow.com?subject=${emailSubject}&body=${emailBody}`;
        window.open(mailtoLink, '_blank');
        setSubmitStatus('fallback');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('fallback');
      // Fallback: Try mailto link
      const emailSubject = encodeURIComponent(`[DapsiWow Contact] ${formData.subject}`);
      const emailBody = encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Subject: ${formData.subject}\n\n` +
        `Message:\n${formData.message}`
      );
      const mailtoLink = `mailto:saifkhan09@dapsiwow.com?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Get in Touch with DapsiWow</title>
        <meta name="description" content="Contact DapsiWow for support, feedback, or suggestions. We're here to help you make the most of our free online tools." />
        <meta name="keywords" content="contact dapsiwow, support, feedback, suggestions, help" />
        <meta property="og:title" content="Contact Us - Get in Touch with DapsiWow" />
        <meta property="og:description" content="Contact DapsiWow for support, feedback, or suggestions. We're here to help you make the most of our free online tools." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/contact" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-contact-us">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-5xl lg:text-6xl font-bold text-neutral-800 mb-6" data-testid="text-page-title">
                  Contact <span className="text-blue-600">DapsiWow</span>
                </h1>
                <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                  We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>
            </div>
          </section>

          <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-contact">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Your full name"
                        data-testid="input-name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                        data-testid="select-subject"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        rows={6}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Tell us how we can help you..."
                        data-testid="textarea-message"
                      ></textarea>
                    </div>

                    {submitStatus === 'success' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6" data-testid="alert-success">
                        <div className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-3"></i>
                          <div>
                            <h4 className="font-medium text-green-800">Message sent successfully!</h4>
                            <p className="text-green-600 text-sm">Thank you for your message. We'll get back to you soon at saifkhan09@dapsiwow.com</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {submitStatus === 'fallback' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6" data-testid="alert-fallback">
                        <div className="flex items-center">
                          <i className="fas fa-envelope text-yellow-500 mr-3"></i>
                          <div>
                            <h4 className="font-medium text-yellow-800">Email client opened</h4>
                            <p className="text-yellow-600 text-sm">We've opened your default email client. Please send the message to saifkhan09@dapsiwow.com</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                        isSubmitting 
                          ? 'bg-green-400 text-white cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m12 2v4a8 8 0 008 8h4A12 12 0 0012 2z"></path>
                          </svg>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-8">
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-neutral-800 mb-6">Get in touch</h2>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <i className="fas fa-envelope text-green-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800">Email</h3>
                          <p className="text-neutral-600">saifkhan09@dapsiwow.com</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <i className="fas fa-clock text-blue-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800">Response Time</h3>
                          <p className="text-neutral-600">Usually within 24 hours</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <i className="fas fa-question-circle text-purple-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800">Quick Help</h3>
                          <p className="text-neutral-600">
                            <a href="/help" className="text-purple-600 hover:underline">
                              Check our Help Center
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">We're here to help!</h3>
                    <p className="text-neutral-600 mb-4">
                      Whether you have a question, need technical support, or want to suggest a new tool, 
                      we're always happy to hear from you.
                    </p>
                    <ul className="text-sm text-neutral-600 space-y-2">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        24-hour response time
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Friendly support team
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        We value your feedback
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ContactUs;
