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

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    
    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields to continue.',
        variant: 'destructive'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address (e.g., user@example.com).',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters long for security.',
        variant: 'destructive'
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'Please make sure both password fields are identical.',
        variant: 'destructive'
      });
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      toast({
        title: 'Weak Password',
        description: 'Password should contain both letters and numbers for better security.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await executeRecaptcha('SIGNUP');
      const displayName = `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ');
      await signup(email, password, displayName);
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
      
      <div className="min-h-screen flex items-center justify-center p-2.5 xs:p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="absolute top-3 left-3 xs:top-4 xs:left-4 sm:top-6 sm:left-6">
          <Logo />
        </div>
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1.5 xs:space-y-2 text-center pb-3 xs:pb-4 sm:pb-6 px-3 xs:px-4 sm:px-6 pt-4 xs:pt-6">
            <CardTitle className="text-xl xs:text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base text-gray-600">
              Get started with DapsiWow and access all our powerful tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4 sm:space-y-5 px-3 xs:px-4 sm:px-6 pb-4 xs:pb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 xs:h-11 sm:h-12 text-xs xs:text-sm sm:text-base font-medium border-gray-300 hover:bg-gray-50 transition-all duration-200"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              data-testid="button-google-signup"
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
                  Or sign up with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 xs:space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
                <div className="space-y-1.5 xs:space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 text-base bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 rounded-xl px-4"
                    data-testid="input-firstname"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>

                <div className="space-y-1.5 xs:space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 text-base bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 rounded-xl px-4"
                    data-testid="input-lastname"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

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
                    placeholder="Create a strong password"
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

              <div className="space-y-1.5 xs:space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-12 h-12 text-base bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 rounded-xl px-4"
                    data-testid="input-confirm-password"
                    required
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    data-testid="button-toggle-confirm-password"
                    disabled={loading || googleLoading}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 xs:h-11 sm:h-12 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 mt-1" 
                disabled={loading || googleLoading}
                data-testid="button-signup"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 xs:mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors" 
                  data-testid="link-login"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 leading-relaxed">
                By creating an account, you agree to our{' '}
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
