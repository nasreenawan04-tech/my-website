import { Helmet } from "react-helmet-async";
import { blogPosts, getAllCategories } from "@/data/blogData";
import { BlogCard } from "@/components/BlogCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, BookOpen, Search, X } from "lucide-react";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const categories = getAllCategories();
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    
    if (!searchQuery.trim()) {
      return matchesCategory;
    }
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
      post.content.toLowerCase().includes(query);
    
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog - DapsiWow Tools | SEO Tips, Finance Guides & Productivity</title>
        <meta 
          name="description" 
          content="Discover expert guides, SEO strategies, financial tips, and productivity hacks on the DapsiWow blog. Learn how to maximize your tools and grow your business." 
        />
        <meta name="keywords" content="blog, SEO tips, financial guides, productivity tools, business advice" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Blog - DapsiWow Tools" />
        <meta property="og:description" content="Expert guides on SEO, finance, and productivity to help you work smarter." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/blog" />
        <meta property="og:image" content="https://dapsiwow.com/images/blog-og.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - DapsiWow Tools" />
        <meta name="twitter:description" content="Expert guides on SEO, finance, and productivity." />
        <meta name="twitter:image" content="https://dapsiwow.com/images/blog-og.jpg" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://dapsiwow.com/blog" />
      </Helmet>

      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 border-b overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        
        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6" data-testid="badge-blog-label">
              <BookOpen className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Insights & Resources</span>
            </div>
            
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white" 
              data-testid="heading-blog-title"
            >
              Learn. Grow. Succeed.
            </h1>
            <p 
              className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed" 
              data-testid="text-blog-description"
            >
              Expert insights on SEO, finance, and productivity to help you work smarter and achieve more.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-12 sm:mb-16">
          <Card className="overflow-hidden hover-elevate active-elevate-2 transition-colors">
            <Link href={`/blog/${featuredPost.slug}`}>
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                    data-testid="img-featured-post"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground" data-testid="badge-featured">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-4" data-testid={`badge-category-featured`}>
                    {featuredPost.category}
                  </Badge>
                  
                  <h2 
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 line-clamp-2" 
                    data-testid="title-featured-post"
                  >
                    {featuredPost.title}
                  </h2>
                  
                  <p 
                    className="text-muted-foreground text-base sm:text-lg mb-6 line-clamp-3" 
                    data-testid="excerpt-featured-post"
                  >
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <time dateTime={featuredPost.dateISO} data-testid="date-featured-post">
                      {featuredPost.date}
                    </time>
                    <span>•</span>
                    <span data-testid="readtime-featured-post">5 min read</span>
                  </div>
                  
                  <span className="inline-flex items-center gap-2 text-primary font-medium group">
                    Read Article
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles by title, keyword, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 border-2 border-gray-300 dark:border-gray-600 focus:border-primary"
              data-testid="input-search-blog"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-clear-search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-3 flex-wrap" data-testid="container-category-filter">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter by:</span>
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            data-testid="button-category-all"
          >
            All Posts
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16" data-testid="container-no-posts">
            <div className="max-w-md mx-auto">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">
                No posts found in this category. Try selecting a different filter.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold" data-testid="heading-latest-posts">
                {selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}
              </h2>
              <span className="text-sm text-muted-foreground" data-testid="text-post-count">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>
            
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10" 
              data-testid="grid-blog-posts"
            >
              {filteredPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
