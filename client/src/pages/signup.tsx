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
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Separator } from '@/components/ui/separator';
import { executeRecaptcha } from '@/lib/recaptcha';
import Logo from '@/components/Logo';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await executeRecaptcha('SIGNUP');
      await signup(email, password);
      toast({
        title: 'Welcome to DapsiWow!',
        description: 'Your account has been created successfully.'
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await executeRecaptcha('SIGNUP');
      await loginWithGoogle();
      toast({
        title: 'Welcome to DapsiWow!',
        description: 'Your account has been created successfully.'
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'Failed to sign up with Google. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - DapsiWow</title>
        <meta name="description" content="Create a DapsiWow account to access all tools and features." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <Logo />
        </div>
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Get started with DapsiWow and access all our powerful tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all duration-200"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              data-testid="button-google-signup"
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
              ) : (
                <FcGoogle className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-neutral-900 px-3 text-gray-500 dark:text-gray-400 font-medium">
                  Or sign up with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base bg-white dark:bg-neutral-950 border-gray-300 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all duration-200"
                    data-testid="input-email"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 text-sm sm:text-base bg-white dark:bg-neutral-950 border-gray-300 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all duration-200"
                    data-testid="input-password"
                    required
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    data-testid="button-toggle-password"
                    disabled={loading || googleLoading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 sm:h-5 w-4 sm:w-5" />
                    ) : (
                      <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 text-sm sm:text-base bg-white dark:bg-neutral-950 border-gray-300 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all duration-200"
                    data-testid="input-confirm-password"
                    required
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    data-testid="button-toggle-confirm-password"
                    disabled={loading || googleLoading}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 sm:h-5 w-4 sm:w-5" />
                    ) : (
                      <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200" 
                disabled={loading || googleLoading}
                data-testid="button-signup"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors" 
                  data-testid="link-login"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
              <p className="text-xs text-center text-gray-500 dark:text-gray-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link href="/terms-of-service" className="text-blue-600 hover:underline dark:text-blue-400 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline dark:text-blue-400 font-medium">
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
