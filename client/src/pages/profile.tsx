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
import { User, Lock, BarChart3, Settings, Loader2, Eye, EyeOff, LogOut, Heart, Clock, History, Trash2, Calendar, Shield } from 'lucide-react';
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
    // Only redirect when loading is complete and user is not authenticated
    if (!loading && !user) {
      setLocation('/login');
      return;
    }

    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');

      // Load statistics
      setFavoritesCount(getFavorites().length);
      setRecentToolsCount(getRecentTools().length);

      // Load calculation history
      loadCalculationHistory();

      // Listen for changes
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

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.'
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
        title: 'Password Changed',
        description: 'Your password has been updated successfully.'
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
      title: 'Favorites Cleared',
      description: 'All favorite tools have been removed.'
    });
  };

  const handleClearRecentTools = () => {
    clearRecentTools();
    toast({
      title: 'History Cleared',
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
      toast({
        title: 'Error',
        description: 'Failed to load calculation history.',
        variant: 'destructive'
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteCalculation = async (calculationId: string) => {
    try {
      // Optimistically update UI
      setCalculationHistory(prev => prev.filter(calc => calc.id !== calculationId));

      await deleteCalculation(calculationId);
      toast({
        title: 'Deleted',
        description: 'Calculation has been deleted.'
      });
    } catch (error) {
      // Reload on error to restore correct state
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
      // Optimistically update UI
      setCalculationHistory([]);

      await clearAllCalculations(user.uid);
      toast({
        title: 'History Cleared',
        description: 'All calculation history has been cleared.'
      });
    } catch (error) {
      // Reload on error to restore correct state
      await loadCalculationHistory();
      toast({
        title: 'Error',
        description: 'Failed to clear calculation history.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile - DapsiWow</title>
        <meta name="description" content="Manage your DapsiWow account settings and preferences." />
      </Helmet>

      <Header />

      {/* Professional Hero Section - Clean 3-color design */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-28 w-28 border-4 border-blue-600 shadow-lg">
              <AvatarImage src={photoURL} alt={displayName || user.email || 'User'} />
              <AvatarFallback className="text-2xl bg-blue-600 text-white font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {displayName || 'Welcome Back'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8" data-testid="text-profile-email">
                {user.email}
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{favoritesCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Favorites</div>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-neutral-700">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{recentToolsCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Recent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{calculationHistory.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Calculations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

          {/* Profile Information Section */}
          <section id="profile">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your personal details and profile picture</p>
            </div>

            <Card className="border border-gray-200 dark:border-neutral-800">
              <CardContent className="p-8">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Display Name</Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-11"
                        data-testid="input-display-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="bg-gray-100 dark:bg-neutral-800 h-11"
                        data-testid="input-email"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoURL" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Picture URL</Label>
                    <Input
                      id="photoURL"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="h-11"
                      data-testid="input-photo-url"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="button-update-profile"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Security Section */}
          <section id="security">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security</h2>
              <p className="text-gray-600 dark:text-gray-400">Keep your account secure with a strong password</p>
            </div>

            <Card className="border border-gray-200 dark:border-neutral-800">
              <CardContent className="p-8">
                {user.providerData[0]?.providerId === 'google.com' ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Google Account</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Password management is handled by your Google account
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</Label>
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
                        <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</Label>
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
                        <Label htmlFor="confirmNewPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</Label>
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
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-change-password"
                    >
                      {passwordLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Calculation History Section */}
          <section id="history">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Calculation History</h2>
              <p className="text-gray-600 dark:text-gray-400">View and manage your past calculations</p>
            </div>

            <Card className="border border-gray-200 dark:border-neutral-800">
              <CardContent className="p-8">
                {historyLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : calculationHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                      <History className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No Calculation History</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Your calculation history will appear here
                    </p>
                    <Link href="/all-tools">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-browse-tools">
                        Browse Tools
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-neutral-700">
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {calculationHistory.length} calculation{calculationHistory.length !== 1 ? 's' : ''}
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid="button-clear-all-calculations">
                            <Trash2 className="h-4 w-4 mr-2" />
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
                    </div>

                    <div className="space-y-4">
                      {calculationHistory.map((calculation) => (
                        <Card key={calculation.id} className="border border-gray-200 dark:border-neutral-700 hover:border-blue-600 dark:hover:border-blue-500 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Link href={calculation.toolPath}>
                                    <Button variant="link" className="p-0 h-auto text-base font-semibold text-blue-600 hover:text-blue-700" data-testid={`link-tool-${calculation.id}`}>
                                      {calculation.toolName}
                                    </Button>
                                  </Link>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    {format(calculation.timestamp, 'PPp')}
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Inputs</p>
                                    <div className="space-y-2 text-sm">
                                      {Object.entries(calculation.inputs).slice(0, 3).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                          <span className="text-gray-600 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                          <span className="font-medium text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <p className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-3">Results</p>
                                    <div className="space-y-2 text-sm">
                                      {Object.entries(calculation.results).slice(0, 3).map(([key, value]) => {
                                        if (typeof value === 'object' && value !== null) return null;
                                        return (
                                          <div key={key} className="flex justify-between">
                                            <span className="text-blue-700 dark:text-blue-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
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
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Account Settings Section */}
          <section id="settings">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your preferences and account data</p>
            </div>

            <Card className="border border-gray-200 dark:border-neutral-800">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="h-12" data-testid="button-clear-favorites">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear Favorites
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear all favorites?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove all tools from your favorites list.
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
                        <Button variant="outline" className="h-12" data-testid="button-clear-history">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear Recent History
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear recent history?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove all recently used tools from your history.
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
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Account Actions</h3>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}