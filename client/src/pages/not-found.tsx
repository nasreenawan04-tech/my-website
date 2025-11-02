import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Search, Home, Calculator, FileText, Heart } from "lucide-react";
import { Link } from "wouter";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Page Not Found - 404 Error | DapsiWow</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore our 180+ free online tools for finance, text processing, and health calculations." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://dapsiwow.com/404" />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-neutral-100 rounded-3xl overflow-hidden">
            <CardContent className="p-10 sm:p-12">
              {/* Error Icon and Message */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                  <AlertCircle className="h-14 w-14 text-red-600" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-700 mb-2">
                  Oops! Page Not Found
                </p>
                <p className="text-gray-600 max-w-md mx-auto">
                  The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>
              </div>
              
              {/* Primary Actions */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <Link href="/">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" data-testid="button-back-home">
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                
                <Link href="/all-tools">
                  <Button variant="outline" className="w-full py-6 text-lg font-semibold border-2 hover:bg-gray-50" data-testid="button-browse-tools">
                    <Search className="w-5 h-5 mr-2" />
                    Browse All Tools
                  </Button>
                </Link>
              </div>
              
              {/* Popular Categories */}
              <div className="pt-8 border-t border-gray-200">
                <p className="text-center text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
                  Popular Categories
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Link href="/finance-tools">
                    <Button variant="ghost" className="w-full h-auto flex flex-col items-center gap-3 p-4 hover:bg-blue-50" data-testid="button-finance-category">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Finance</span>
                    </Button>
                  </Link>
                  <Link href="/text-tools">
                    <Button variant="ghost" className="w-full h-auto flex flex-col items-center gap-3 p-4 hover:bg-purple-50" data-testid="button-text-category">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Text</span>
                    </Button>
                  </Link>
                  <Link href="/health-tools">
                    <Button variant="ghost" className="w-full h-auto flex flex-col items-center gap-3 p-4 hover:bg-pink-50" data-testid="button-health-category">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Health</span>
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Popular Tools */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-sm font-semibold text-gray-700 mb-4">
                  Or try one of our popular tools:
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Link href="/tools/loan-calculator" className="text-center py-3 px-4 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors" data-testid="link-loan-calc">
                    Loan Calculator
                  </Link>
                  <Link href="/tools/bmi-calculator" className="text-center py-3 px-4 rounded-lg bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 font-medium transition-colors" data-testid="link-bmi-calc">
                    BMI Calculator
                  </Link>
                  <Link href="/tools/word-counter" className="text-center py-3 px-4 rounded-lg bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-600 font-medium transition-colors" data-testid="link-word-counter">
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
