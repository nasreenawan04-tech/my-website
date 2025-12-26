import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { useFavorites } from '@/hooks/use-favorites';
import { Star, Trash2, ArrowLeft, FolderPlus, Edit2, Check, X, Folder } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clearAllFavorites } from '@/lib/userPreferences';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const FavoriteTools = () => {
  const { 
    favorites, 
    categories, 
    addFavoriteCategory, 
    renameFavoriteCategory, 
    deleteFavoriteCategory,
    updateFavoriteCategory
  } = useFavorites();
  const { toast } = useToast();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleClearFavorites = () => {
    if (confirm('Are you sure you want to remove all favorite tools?')) {
      clearAllFavorites();
      toast({
        title: "Favorites cleared",
        description: "All favorite tools have been removed.",
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addFavoriteCategory(newCategoryName);
    setNewCategoryName('');
    setIsAddingCategory(false);
    toast({
      title: "Category added",
      description: `Category "${newCategoryName}" has been created.`,
    });
  };

  const handleRenameCategory = (id: string) => {
    if (!editingName.trim()) return;
    renameFavoriteCategory(id, editingName);
    setEditingCategoryId(null);
    toast({
      title: "Category renamed",
      description: `Category has been renamed to "${editingName}".`,
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"? Tools will be moved to "Uncategorized".`)) {
      deleteFavoriteCategory(id);
      toast({
        title: "Category deleted",
        description: `Category "${name}" has been removed.`,
      });
    }
  };

  // Group tools by category
  const groupedFavorites = categories.reduce((acc, category) => {
    acc[category.id] = favorites.filter(f => f.categoryId === category.id);
    return acc;
  }, {} as Record<string, typeof favorites>);

  const uncategorizedTools = favorites.filter(f => !f.categoryId || !categories.find(c => c.id === f.categoryId));

  return (
    <>
      <Helmet>
        <title>Favorite Tools - Your Saved Tools | DapsiWow</title>
        <meta name="description" content="Access your favorite tools quickly. Save and manage the tools you use most frequently." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://dapsiwow.com/favorite-tools" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950" data-testid="page-favorite-tools">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-pink-600 text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/20 to-transparent" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Back Button */}
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-6 sm:mb-8 text-sm sm:text-base"
                data-testid="link-back-home"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Back to Home</span>
              </Link>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                    <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-page-title">
                      Favorite Tools
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-yellow-100 mt-2">
                      Organize and access your saved tools
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="gap-2 bg-white/20 text-white hover:bg-white/30 border-0">
                        <FolderPlus size={18} />
                        New Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Custom Category</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          placeholder="e.g. Finance Tools, Work, etc."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                          autoFocus
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                        <Button onClick={handleAddCategory}>Create Category</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold mb-1" data-testid="text-favorite-tools-count">{favorites.length}</div>
                  <div className="text-yellow-100 text-xs sm:text-sm" data-testid="text-favorite-tools-count-label">Favorite Tools</div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Content */}
          <section className="py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {favorites.length > 0 ? (
                <div className="space-y-12">
                  {/* Category Sections */}
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-6">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                            <Folder className="w-5 h-5 text-neutral-500" />
                          </div>
                          {editingCategoryId === category.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-8 w-48"
                                autoFocus
                              />
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleRenameCategory(category.id)}>
                                <Check size={16} />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingCategoryId(null)}>
                                <X size={16} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                                {category.name}
                              </h2>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
                                onClick={() => {
                                  setEditingCategoryId(category.id);
                                  setEditingName(category.name);
                                }}
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-neutral-400 hover:text-red-600"
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                          <span className="text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-xs">
                            {groupedFavorites[category.id]?.length || 0}
                          </span>
                        </div>
                      </div>

                      {groupedFavorites[category.id]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {groupedFavorites[category.id].map((tool) => (
                            <div key={tool.id} className="relative group">
                              <ToolCard tool={tool} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl p-8 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                          <p className="text-neutral-500">No tools in this category. Use the category selector on a tool card to move tools here.</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Uncategorized Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                          <Star className="w-5 h-5 text-neutral-500" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                          {categories.length > 0 ? 'Uncategorized' : 'All Favorites'}
                        </h2>
                        <span className="text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-xs">
                          {uncategorizedTools.length}
                        </span>
                      </div>

                      {categories.length === 0 && (
                        <Button
                          onClick={handleClearFavorites}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Trash2 size={14} />
                          Clear All
                        </Button>
                      )}
                    </div>

                    {uncategorizedTools.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {uncategorizedTools.map((tool) => (
                          <div key={tool.id} className="relative group">
                            <ToolCard tool={tool} />
                          </div>
                        ))}
                      </div>
                    ) : categories.length > 0 ? (
                      <div className="bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl p-8 text-center">
                        <p className="text-neutral-500">All tools have been categorized.</p>
                      </div>
                    ) : null}
                  </div>

                  {categories.length > 0 && (
                    <div className="flex justify-end pt-8">
                      <Button
                        onClick={handleClearFavorites}
                        variant="outline"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={16} />
                        Clear All Favorites
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full mb-6">
                    <Star className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-3">
                    No Favorite Tools Yet
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                    Click the star icon on any tool card to add it to your favorites. You can then organize them into custom categories.
                  </p>
                  <Link 
                    href="/tools"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
                  >
                    Browse All Tools
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FavoriteTools;
