import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Page Not Found - 404 Error | DapsiWow</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore our 23 free online tools for finance, text processing, and health calculations." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://dapsiwow.com/404" />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
                <p className="text-gray-600">
                  Sorry, the page you're looking for doesn't exist or has been moved.
                </p>
              </div>
              
              <div className="space-y-4">
                <Link href="/">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                
                <Link href="/all-tools">
                  <Button variant="outline" className="w-full">
                    Browse All Tools
                  </Button>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Looking for our calculators? Try our popular tools:
                </p>
                <div className="mt-3 space-y-1">
                  <Link href="/tools/loan-calculator" className="block text-sm text-blue-600 hover:text-blue-700">
                    Loan Calculator
                  </Link>
                  <Link href="/tools/bmi-calculator" className="block text-sm text-blue-600 hover:text-blue-700">
                    BMI Calculator
                  </Link>
                  <Link href="/tools/word-counter" className="block text-sm text-blue-600 hover:text-blue-700">
                    Word Counter
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
