
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { User, Lock, BarChart3, Settings, Loader2, Eye, EyeOff, LogOut, Heart, Clock, History, Trash2, Calendar, Shield, Mail, Edit3, Check, X } from 'lucide-react';
import { getFavorites, getRecentTools, clearAllFavorites, clearRecentTools } from '@/lib/userPreferences';
import { getCalculationHistory, deleteCalculation, clearAllCalculations, CalculationHistory } from '@/lib/calculationHistory';
import { Link } from 'wouter';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Profile() {
  const { user, logout, updateUserProfile, updateUserPassword, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Statistics state
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [recentToolsCount, setRecentToolsCount] = useState(0);

  // Calculation history state
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
      return;
    }

    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');

      setFavoritesCount(getFavorites().length);
      setRecentToolsCount(getRecentTools().length);

      loadCalculationHistory();

      const handleFavoritesChange = () => setFavoritesCount(getFavorites().length);
      const handleRecentChange = () => setRecentToolsCount(getRecentTools().length);

      window.addEventListener('favoritesChanged', handleFavoritesChange);
      window.addEventListener('recentToolsChanged', handleRecentChange);

      return () => {
        window.removeEventListener('favoritesChanged', handleFavoritesChange);
        window.removeEventListener('recentToolsChanged', handleRecentChange);
      };
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      await updateUserProfile(displayName, photoURL || undefined);
      setIsEditingProfile(false);
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    setPasswordLoading(true);

    try {
      await updateUserPassword(currentPassword, newPassword);
      toast({
        title: 'Success',
        description: 'Your password has been updated successfully.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.'
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log out',
        variant: 'destructive'
      });
    }
  };

  const handleClearFavorites = () => {
    clearAllFavorites();
    toast({
      title: 'Success',
      description: 'All favorite tools have been removed.'
    });
  };

  const handleClearRecentTools = () => {
    clearRecentTools();
    toast({
      title: 'Success',
      description: 'Your recently used tools history has been cleared.'
    });
  };

  const loadCalculationHistory = async () => {
    if (!user) return;

    setHistoryLoading(true);
    try {
      const history = await getCalculationHistory(user.uid);
      setCalculationHistory(history);
    } catch (error) {
      console.error('Failed to load calculation history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteCalculation = async (calculationId: string) => {
    try {
      setCalculationHistory(prev => prev.filter(calc => calc.id !== calculationId));
      await deleteCalculation(calculationId);
      toast({
        title: 'Success',
        description: 'Calculation has been deleted.'
      });
    } catch (error) {
      await loadCalculationHistory();
      toast({
        title: 'Error',
        description: 'Failed to delete calculation.',
        variant: 'destructive'
      });
    }
  };

  const handleClearAllCalculations = async () => {
    if (!user) return;

    try {
      setCalculationHistory([]);
      await clearAllCalculations(user.uid);
      toast({
        title: 'Success',
        description: 'All calculation history has been cleared.'
      });
    } catch (error) {
      await loadCalculationHistory();
      toast({
        title: 'Error',
        description: 'Failed to clear calculation history.',
        variant: 'destructive'
      });
    }
  };

  const isGoogleUser = user.providerData[0]?.providerId === 'google.com';

  return (
    <>
      <Helmet>
        <title>My Profile - DapsiWow</title>
        <meta name="description" content="Manage your DapsiWow account settings and preferences." />
      </Helmet>

      <Header />

      {/* Modern Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <Avatar className="relative h-32 w-32 border-4 border-white shadow-2xl">
                <AvatarImage src={photoURL} alt={displayName || user.email || 'User'} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                {displayName || 'Welcome Back'}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-blue-100 mb-6">
                <Mail className="h-5 w-5" />
                <p className="text-lg" data-testid="text-profile-email">{user.email}</p>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto md:mx-0">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-8 w-8 text-white mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white mb-1">{favoritesCount}</div>
                    <div className="text-sm text-blue-100 font-medium">Favorites</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-white mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white mb-1">{recentToolsCount}</div>
                    <div className="text-sm text-blue-100 font-medium">Recent</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <History className="h-8 w-8 text-white mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white mb-1">{calculationHistory.length}</div>
                    <div className="text-sm text-blue-100 font-medium">Calculations</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Profile Information</CardTitle>
                      <CardDescription className="mt-1">Update your personal details and avatar</CardDescription>
                    </div>
                    {!isEditingProfile && (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingProfile(true)}
                        className="gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-sm font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Display Name
                        </Label>
                        <Input
                          id="displayName"
                          type="text"
                          placeholder="Your name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          disabled={!isEditingProfile}
                          className="h-11"
                          data-testid="input-display-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="bg-gray-100 dark:bg-neutral-800 h-11"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photoURL" className="text-sm font-semibold">Profile Picture URL</Label>
                      <Input
                        id="photoURL"
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        disabled={!isEditingProfile}
                        className="h-11"
                        data-testid="input-photo-url"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enter a URL to your profile picture</p>
                    </div>

                    {isEditingProfile && (
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={profileLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                          data-testid="button-update-profile"
                        >
                          {profileLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setDisplayName(user.displayName || '');
                            setPhotoURL(user.photoURL || '');
                          }}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                  <CardTitle className="text-2xl">Security Settings</CardTitle>
                  <CardDescription className="mt-1">Manage your password and account security</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {isGoogleUser ? (
                    <div className="text-center py-12">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Google Account Security</h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        Your account is secured through Google. Password management is handled by your Google account settings.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-semibold flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pr-10 h-11"
                            required
                            data-testid="input-current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            data-testid="button-toggle-current-password"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-semibold">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pr-10 h-11"
                              required
                              data-testid="input-new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              data-testid="button-toggle-new-password"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmNewPassword" className="text-sm font-semibold">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmNewPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm new password"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              className="pr-10 h-11"
                              required
                              data-testid="input-confirm-new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              data-testid="button-toggle-confirm-new-password"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        data-testid="button-change-password"
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Calculation History</CardTitle>
                      <CardDescription className="mt-1">View and manage your past calculations</CardDescription>
                    </div>
                    {calculationHistory.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2" data-testid="button-clear-all-calculations">
                            <Trash2 className="h-4 w-4" />
                            Clear All
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clear all calculation history?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete all your calculation history. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearAllCalculations} className="bg-blue-600 hover:bg-blue-700">
                              Clear All
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {historyLoading ? (
                    <div className="flex justify-center py-16">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
                      </div>
                    </div>
                  ) : calculationHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mx-auto mb-6">
                        <History className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Calculations Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Start using our calculation tools and your history will appear here
                      </p>
                      <Link href="/all-tools">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" data-testid="button-browse-tools">
                          <BarChart3 className="h-4 w-4" />
                          Browse Tools
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {calculationHistory.map((calculation) => (
                        <Card key={calculation.id} className="border border-gray-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                  <Link href={calculation.toolPath}>
                                    <Button variant="link" className="p-0 h-auto text-lg font-semibold text-blue-600 hover:text-blue-700" data-testid={`link-tool-${calculation.id}`}>
                                      {calculation.toolName}
                                    </Button>
                                  </Link>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    {format(calculation.timestamp, 'PPp')}
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
                                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                      <Settings className="h-4 w-4" />
                                      Inputs
                                    </p>
                                    <div className="space-y-2 text-sm">
                                      {Object.entries(calculation.inputs).slice(0, 3).map(([key, value]) => (
                                        <div key={key} className="flex justify-between gap-2">
                                          <span className="text-gray-600 dark:text-gray-400 capitalize truncate">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                          <span className="font-medium text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                    <p className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4" />
                                      Results
                                    </p>
                                    <div className="space-y-2 text-sm">
                                      {Object.entries(calculation.results).slice(0, 3).map(([key, value]) => {
                                        if (typeof value === 'object' && value !== null) return null;
                                        return (
                                          <div key={key} className="flex justify-between gap-2">
                                            <span className="text-blue-700 dark:text-blue-400 capitalize truncate">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                            <span className="font-semibold text-blue-900 dark:text-blue-200">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" data-testid={`button-delete-${calculation.id}`}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this calculation?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this calculation from your history.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCalculation(calculation.id!)} className="bg-blue-600 hover:bg-blue-700">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                  <CardTitle className="text-2xl">Account Settings</CardTitle>
                  <CardDescription className="mt-1">Manage your preferences and account data</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      Data Management
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="h-auto py-4 flex-col items-start text-left" data-testid="button-clear-favorites">
                            <div className="flex items-center gap-2 mb-1">
                              <Heart className="h-4 w-4" />
                              <span className="font-semibold">Clear Favorites</span>
                            </div>
                            <span className="text-xs text-gray-500">{favoritesCount} favorite tools</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clear all favorites?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove all {favoritesCount} tools from your favorites list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearFavorites} className="bg-blue-600 hover:bg-blue-700">
                              Clear Favorites
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="h-auto py-4 flex-col items-start text-left" data-testid="button-clear-history">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4" />
                              <span className="font-semibold">Clear Recent History</span>
                            </div>
                            <span className="text-xs text-gray-500">{recentToolsCount} recent tools</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clear recent history?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove all {recentToolsCount} recently used tools from your history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearRecentTools} className="bg-blue-600 hover:bg-blue-700">
                              Clear History
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <LogOut className="h-5 w-5" />
                      Account Actions
                    </h3>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="h-auto py-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 gap-2"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Sign Out</div>
                        <div className="text-xs opacity-75">Log out from your account</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </>
  );
}
