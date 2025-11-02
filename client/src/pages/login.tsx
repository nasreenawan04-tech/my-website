import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Separator } from '@/components/ui/separator';
import { executeRecaptcha } from '@/lib/recaptcha';
import Logo from '@/components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password to continue.',
        variant: 'destructive'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await executeRecaptcha('LOGIN');
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.'
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to log in. Please check your credentials.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await executeRecaptcha('LOGIN');
      await loginWithGoogle();
      toast({
        title: 'Welcome!',
        description: 'You have successfully signed in with Google.'
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Failed to sign in with Google. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - DapsiWow</title>
        <meta name="description" content="Log in to your DapsiWow account to access all tools and features." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center p-2.5 xs:p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="absolute top-3 left-3 xs:top-4 xs:left-4 sm:top-6 sm:left-6">
          <Logo />
        </div>
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1.5 xs:space-y-2 text-center pb-3 xs:pb-4 sm:pb-6 px-3 xs:px-4 sm:px-6 pt-4 xs:pt-6">
            <CardTitle className="text-xl xs:text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base text-gray-600">
              Sign in to access your account and continue using our tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4 sm:space-y-5 px-3 xs:px-4 sm:px-6 pb-4 xs:pb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 xs:h-11 sm:h-12 text-xs xs:text-sm sm:text-base font-medium border-gray-300 hover:bg-gray-50 transition-all duration-200"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              data-testid="button-google-signin"
            >
              {googleLoading ? (
                <Loader2 className="mr-1.5 xs:mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
              ) : (
                <FcGoogle className="mr-1.5 xs:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 xs:space-y-3 sm:space-y-4">
              <div className="space-y-1.5 xs:space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 rounded-xl px-4"
                  data-testid="input-email"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
              
              <div className="space-y-1.5 xs:space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12 h-12 text-base bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 rounded-xl px-4"
                    data-testid="input-password"
                    required
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    data-testid="button-toggle-password"
                    disabled={loading || googleLoading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors" 
                  data-testid="link-forgot-password"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 xs:h-11 sm:h-12 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200" 
                disabled={loading || googleLoading}
                data-testid="button-login"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 xs:mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors" 
                  data-testid="link-signup"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 leading-relaxed">
                By signing in, you agree to our{' '}
                <Link href="/terms-of-service" className="text-blue-600 hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
