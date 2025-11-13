import { Helmet } from "react-helmet-async";
import { blogPosts, getAllCategories } from "@/data/blogData";
import { BlogCard } from "@/components/BlogCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getAllCategories();
  
  const filteredPosts = selectedCategory
    ? blogPosts.filter(post => post.category === selectedCategory)
    : blogPosts;

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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6" 
              data-testid="heading-blog-title"
            >
              Blog - DapsiWow Tools
            </h1>
            <p 
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" 
              data-testid="text-blog-description"
            >
              Expert insights on SEO, finance, productivity, and tools to help you work smarter and grow faster.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap gap-2 justify-center" data-testid="container-category-filter">
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
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12" data-testid="container-no-posts">
            <p className="text-muted-foreground text-lg">
              No posts found in this category.
            </p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" 
            data-testid="grid-blog-posts"
          >
            {filteredPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
