import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Mail, Clock, HelpCircle, Send, CheckCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertContactSubmissionSchema } from '@shared/schema';

const contactFormSchema = insertContactSubmissionSchema.extend({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactUs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Message sent successfully!',
        description: 'Thank you for your message. We\'ll get back to you soon.',
      });
      form.reset();
    },
    onError: (error: Error) => {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Sorry, there was an error sending your message. Please try again or contact us directly.',
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
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
                <Card>
                  <CardHeader>
                    <CardTitle>Send us a message</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-contact">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your full name"
                                data-testid="input-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your.email@example.com"
                                data-testid="input-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-subject">
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General Inquiry</SelectItem>
                                <SelectItem value="support">Technical Support</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="bug">Bug Report</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us how we can help you..."
                                className="resize-vertical"
                                rows={6}
                                data-testid="textarea-message"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={contactMutation.isPending}
                        data-testid="button-submit"
                      >
                        {contactMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Get in touch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <Mail className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800">Email</h3>
                          <p className="text-neutral-600" data-testid="text-contact-email">saifkhan09@dapsiwow.com</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800">Response Time</h3>
                          <p className="text-neutral-600">Usually within 24 hours</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <HelpCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800">Quick Help</h3>
                          <p className="text-neutral-600">
                            <a href="/help" className="text-purple-600 hover:underline" data-testid="link-help">
                              Check our Help Center
                            </a>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-neutral-800 mb-4">We're here to help!</h3>
                      <p className="text-neutral-600 mb-4">
                        Whether you have a question, need technical support, or want to suggest a new tool, 
                        we're always happy to hear from you.
                      </p>
                      <ul className="text-sm text-neutral-600 space-y-2">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          24-hour response time
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Friendly support team
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          We value your feedback
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
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
