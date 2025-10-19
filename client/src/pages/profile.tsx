import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { User, Lock, BarChart3, Settings, Loader2, Eye, EyeOff, LogOut, Heart, Clock, Mail, Shield, Trash2, CheckCircle } from 'lucide-react';
import { getFavorites, getRecentTools, clearAllFavorites, clearRecentTools } from '@/lib/userPreferences';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading your profile...</p>
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
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        className: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
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
        description: 'New passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive'
      });
      return;
    }

    setPasswordLoading(true);

    try {
      await updateUserPassword(currentPassword, newPassword);
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
        className: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Password Change Failed',
        description: error.message || 'Failed to change password.',
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
        description: 'You have been successfully logged out.',
        className: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
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
      description: 'All favorite tools have been removed.',
      className: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    });
  };

  const handleClearRecentTools = () => {
    clearRecentTools();
    toast({
      title: 'History Cleared',
      description: 'Your recently used tools history has been cleared.',
      className: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    });
  };

  return (
    <>
      <Helmet>
        <title>My Profile - DapsiWow</title>
        <meta name="description" content="Manage your DapsiWow account settings and preferences." />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
        {/* Hero Header with Gradient - Responsive */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 pt-16 sm:pt-20 pb-24 sm:pb-32 px-4">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
          <div className="relative max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-4 sm:gap-6 sm:flex-row">
              {/* Avatar - Responsive sizes */}
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 border-4 border-white dark:border-neutral-800 shadow-2xl flex-shrink-0">
                <AvatarImage src={photoURL} alt={displayName || user.email || 'User'} />
                <AvatarFallback className="text-2xl sm:text-3xl md:text-4xl bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              {/* Profile Info - Responsive text */}
              <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 break-words">
                  {displayName || 'User Profile'}
                </h1>
                <p className="text-white/90 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-2 justify-center sm:justify-start flex-wrap" data-testid="text-profile-email">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="break-all">{user.email}</span>
                </p>
                
                {/* Stats Badges - Responsive */}
                <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start flex-wrap">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 text-sm sm:text-base">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="font-semibold">{favoritesCount}</span>
                    <span className="hidden xs:inline">Favorites</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 text-sm sm:text-base">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="font-semibold">{recentToolsCount}</span>
                    <span className="hidden xs:inline">Recent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Responsive spacing */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 -mt-16 sm:-mt-20 pb-8 sm:pb-12">
          <Tabs defaultValue="profile" className="w-full">
            {/* Tabs List - Mobile optimized */}
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-neutral-800 shadow-lg mb-4 sm:mb-6 h-auto">
              <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5" data-testid="tab-profile">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5" data-testid="tab-security">
                <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5" data-testid="tab-statistics">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5" data-testid="tab-settings">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="border-0 shadow-xl bg-white dark:bg-neutral-800">
                <CardHeader className="border-b dark:border-neutral-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl truncate">Profile Information</CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base">
                        Update your personal information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm sm:text-base font-medium">Display Name</Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        data-testid="input-display-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="h-10 sm:h-11 pl-9 sm:pl-10 bg-gray-50 dark:bg-neutral-900 text-sm sm:text-base"
                          data-testid="input-email"
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Email cannot be changed for security reasons</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photoURL" className="text-sm sm:text-base font-medium">Profile Picture URL</Label>
                      <Input
                        id="photoURL"
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        data-testid="input-photo-url"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Enter a URL to an image for your profile picture
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base"
                      data-testid="button-update-profile"
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Update Profile</span>
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="border-0 shadow-xl bg-white dark:bg-neutral-800">
                <CardHeader className="border-b dark:border-neutral-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl truncate">Security Settings</CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base">
                        Update your password
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {user.providerData[0]?.providerId === 'google.com' ? (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
                      <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-600 flex items-center justify-center">
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="font-semibold text-base sm:text-lg text-blue-900 dark:text-blue-100 mb-1">
                            Google Account
                          </h3>
                          <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
                            You signed in with Google. Password changes are managed through your Google account for enhanced security.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm sm:text-base font-medium">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pr-10 h-10 sm:h-11 text-sm sm:text-base"
                            required
                            data-testid="input-current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            data-testid="button-toggle-current-password"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm sm:text-base font-medium">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password (min. 6 characters)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-10 h-10 sm:h-11 text-sm sm:text-base"
                            required
                            data-testid="input-new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            data-testid="button-toggle-new-password"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword" className="text-sm sm:text-base font-medium">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmNewPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="pr-10 h-10 sm:h-11 text-sm sm:text-base"
                            required
                            data-testid="input-confirm-new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            data-testid="button-toggle-confirm-new-password"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base"
                        data-testid="button-change-password"
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span>Changing...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Change Password</span>
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics">
              <Card className="border-0 shadow-xl bg-white dark:bg-neutral-800">
                <CardHeader className="border-b dark:border-neutral-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl truncate">Usage Statistics</CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base">
                        View your activity
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                    {/* Favorites Card - Mobile optimized */}
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="absolute top-0 right-0 opacity-10">
                        <Heart className="h-24 w-24 sm:h-32 sm:w-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                            <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-white/80">Favorite Tools</p>
                            <p className="text-3xl sm:text-4xl font-bold tabular-nums" data-testid="text-favorites-count">{favoritesCount}</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-white/80">
                          Tools you've marked as favorites
                        </p>
                      </div>
                    </div>

                    {/* Recent Tools Card - Mobile optimized */}
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="absolute top-0 right-0 opacity-10">
                        <Clock className="h-24 w-24 sm:h-32 sm:w-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-white/80">Recently Used</p>
                            <p className="text-3xl sm:text-4xl font-bold tabular-nums" data-testid="text-recent-count">{recentToolsCount}</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-white/80">
                          Tools you've used recently
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-900">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      Your usage data helps us improve your experience. All statistics are stored locally and never shared.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="border-0 shadow-xl bg-white dark:bg-neutral-800">
                <CardHeader className="border-b dark:border-neutral-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl truncate">Account Settings</CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base">
                        Manage preferences and data
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Data Management Section */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span>Data Management</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Clear your saved preferences and usage data
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="h-10 sm:h-11 border-2 hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 text-sm sm:text-base w-full" data-testid="button-clear-favorites">
                            <Heart className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Clear Favorites</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base sm:text-lg">Clear all favorites?</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs sm:text-sm">
                              This will remove all tools from your favorites list. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearFavorites} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                              Clear Favorites
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="h-10 sm:h-11 border-2 hover:border-purple-600 hover:text-purple-600 dark:hover:border-purple-400 dark:hover:text-purple-400 text-sm sm:text-base w-full" data-testid="button-clear-history">
                            <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Clear History</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base sm:text-lg">Clear recent history?</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs sm:text-sm">
                              This will remove all recently used tools from your history. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearRecentTools} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                              Clear History
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Account Actions Section */}
                  <div className="pt-4 sm:pt-6 border-t dark:border-neutral-700 space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <span>Account Actions</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Sign out of your account
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="h-10 sm:h-11 px-4 sm:px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-sm sm:text-base w-full sm:w-auto"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Sign Out</span>
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
