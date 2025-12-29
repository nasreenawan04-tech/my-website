
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
import { User, Lock, BarChart3, Settings, Loader2, Eye, EyeOff, LogOut, Heart, Clock, History, Trash2, Calendar, Shield, TrendingUp, Activity, Award, ChevronRight, Scale } from 'lucide-react';
import { getFavorites, getRecentTools, clearAllFavorites, clearRecentTools } from '@/lib/userPreferences';
import { CalculationHistory, getCalculationHistory, deleteCalculation, clearAllCalculations } from '@/lib/calculationHistory';
import { tools } from '@/data/tools';
import { Link } from 'wouter';
import { format, formatDistanceToNow } from 'date-fns';
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
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import defaultAvatarUrl from '@assets/jhj_1761976221112.png';

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

  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');

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
      loadHistory();

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

  const loadHistory = async () => {
    if (!user) return;

    setHistoryLoading(true);
    try {
      const calcHistory = await getCalculationHistory();
      setCalculationHistory(calcHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteCalculation = async (calculationId: string) => {
    try {
      setCalculationHistory(prev => prev.filter(calc => calc.id !== calculationId));
      await deleteCalculation(calculationId);
      toast({
        title: 'Deleted',
        description: 'Calculation has been deleted.'
      });
    } catch (error) {
      await loadHistory();
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
      await clearAllCalculations();
      toast({
        title: 'History Cleared',
        description: 'All calculation history has been cleared.'
      });
    } catch (error) {
      await loadHistory();
      toast({
        title: 'Error',
        description: 'Failed to clear calculation history.',
        variant: 'destructive'
      });
    }
  };

  const getMemberSince = () => {
    if (user.metadata.creationTime) {
      return format(new Date(user.metadata.creationTime), 'MMMM yyyy');
    }
    return 'Recently';
  };

  const getActivityLevel = () => {
    const total = calculationHistory.length + favoritesCount;
    if (total >= 50) return { label: 'Expert', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' };
    if (total >= 20) return { label: 'Advanced', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' };
    if (total >= 5) return { label: 'Active', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    return { label: 'Beginner', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' };
  };

  const activityLevel = getActivityLevel();

  return (
    <>
      <Helmet>
        <title>My Profile - DapsiWow</title>
        <meta name="description" content="Manage your DapsiWow account settings and preferences." />
      </Helmet>

      <Header />

      {/* Professional Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-neutral-700 shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900/30">
                <AvatarImage src={photoURL || defaultAvatarUrl} alt={displayName || user.email || 'User'} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {displayName || 'Welcome Back'}
                </h1>
                <Badge className={`${activityLevel.bgColor} ${activityLevel.color} border-0`}>
                  <Award className="h-3 w-3 mr-1" />
                  {activityLevel.label}
                </Badge>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2" data-testid="text-profile-email">
                {user.email}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                Member since {getMemberSince()}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Link href="/all-tools">
                <Button variant="outline" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Browse Tools
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be redirected to the home page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-gray-200 dark:border-neutral-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calculations</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{calculationHistory.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-gray-200 dark:border-neutral-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{favoritesCount}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-gray-200 dark:border-neutral-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Tools</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{recentToolsCount}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-gray-200 dark:border-neutral-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activity</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{calculationHistory.length + favoritesCount}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="comparisons" className="gap-2">
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Comparisons</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest calculations and tool usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : calculationHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 text-sm">No recent activity</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {calculationHistory.slice(0, 5).map((calc) => (
                          <div key={calc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                            <div className="flex-1 min-w-0">
                              <Link href={calc.toolPath}>
                                <p className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm truncate">
                                  {calc.toolName}
                                </p>
                              </Link>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDistanceToNow(calc.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                        {calculationHistory.length > 5 && (
                          <Button
                            variant="ghost"
                            className="w-full text-blue-600 hover:text-blue-700"
                            onClick={() => setActiveTab('settings')}
                          >
                            View all {calculationHistory.length} calculations
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Usage Statistics
                    </CardTitle>
                    <CardDescription>Your activity insights</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Most Active Day</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          {calculationHistory.length > 0 ? 'This week' : 'No data yet'}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Favorite Category</p>
                        <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                          {favoritesCount > 0 ? 'Finance Tools' : 'Not set'}
                        </p>
                      </div>
                      <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-300">Streak</p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          {calculationHistory.length > 0 ? '3 days' : 'Start using tools'}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comparisons" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    Comparisons
                  </CardTitle>
                  <CardDescription>Tool comparison feature</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Scale className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Tool comparison feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and profile picture</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          type="text"
                          placeholder="Your name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          data-testid="input-display-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="bg-gray-100 dark:bg-neutral-800"
                          data-testid="input-email"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photoURL">Profile Picture URL</Label>
                      <Input
                        id="photoURL"
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        data-testid="input-photo-url"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-blue-600 hover:bg-blue-700"
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
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Keep your account secure with a strong password</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.providerData[0]?.providerId === 'google.com' ? (
                    <div className="text-center py-12">
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
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pr-10"
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
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pr-10"
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
                          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmNewPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm new password"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              className="pr-10"
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
                        className="bg-blue-600 hover:bg-blue-700"
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
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Calculation History</CardTitle>
                      <CardDescription>View and manage your past calculations</CardDescription>
                    </div>
                    {calculationHistory.length > 0 && (
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
                            <AlertDialogAction onClick={handleClearAllCalculations} className="bg-red-600 hover:bg-red-700">
                              Clear All
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : calculationHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <History className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Calculation History</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your calculation history will appear here
                      </p>
                      <Link href="/all-tools">
                        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-browse-tools">
                          Browse Tools
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {calculationHistory.map((calculation) => (
                        <Card key={calculation.id} className="border-gray-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1 space-y-3 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <Link href={calculation.toolPath}>
                                    <Button variant="link" className="p-0 h-auto text-base font-semibold text-blue-600 hover:text-blue-700 justify-start" data-testid={`link-tool-${calculation.id}`}>
                                      <span className="truncate">{calculation.toolName}</span>
                                    </Button>
                                  </Link>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {format(calculation.timestamp, 'PPp')}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 sm:p-4">
                                    <p className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Inputs</p>
                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                      {Object.entries(calculation.inputs).slice(0, 3).map(([key, value]) => (
                                        <div key={key} className="flex justify-between gap-2">
                                          <span className="text-gray-600 dark:text-gray-400 capitalize truncate">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                          <span className="font-medium text-gray-900 dark:text-white text-right">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                                    <p className="font-semibold text-xs sm:text-sm text-blue-900 dark:text-blue-300 mb-2 sm:mb-3">Results</p>
                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                      {Object.entries(calculation.results).slice(0, 3).map(([key, value]) => {
                                        if (typeof value === 'object' && value !== null) return null;
                                        return (
                                          <div key={key} className="flex justify-between gap-2">
                                            <span className="text-blue-700 dark:text-blue-400 capitalize truncate">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                            <span className="font-semibold text-blue-900 dark:text-blue-200 text-right">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex sm:flex-col items-center gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" data-testid={`button-delete-${calculation.id}`}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="w-[95vw] max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete this calculation?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete this calculation from your history.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                      <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCalculation(calculation.id!)} className="bg-red-600 hover:bg-red-700">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
