import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { getBlogPostBySlug } from "@/data/blogData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BlogPost() {
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const { toast } = useToast();
  const post = params?.slug ? getBlogPostBySlug(params.slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center" data-testid="container-post-not-found">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <Link href="/blog">
            <Button data-testid="button-back-to-blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const sharePost = async () => {
    const url = `https://dapsiwow.com/blog/${post.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
        toast({
          title: "Shared successfully",
          description: "Thanks for sharing this post!",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copied",
      description: "Post URL copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} | DapsiWow Blog</title>
        <meta name="description" content={post.metaDescription} />
        <meta name="keywords" content={post.keywords.join(", ")} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://dapsiwow.com/blog/${post.slug}`} />
        <meta property="og:image" content={post.image} />
        <meta property="article:published_time" content={post.dateISO} />
        <meta property="article:modified_time" content={post.dateModified} />
        <meta property="article:section" content={post.category} />
        <meta property="article:author" content={post.author.name} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription} />
        <meta name="twitter:image" content={post.image} />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://dapsiwow.com/blog/${post.slug}`} />
        
        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.metaDescription,
            "image": post.image,
            "datePublished": post.dateISO,
            "dateModified": post.dateModified,
            "author": {
              "@type": post.author.type,
              "name": post.author.name
            },
            "publisher": {
              "@type": "Organization",
              "name": "DapsiWow",
              "logo": {
                "@type": "ImageObject",
                "url": "https://dapsiwow.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://dapsiwow.com/blog/${post.slug}`
            },
            "keywords": post.keywords.join(", "),
            "articleSection": post.category
          })}
        </script>
      </Helmet>

      {/* Back to Blog Button */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/blog">
          <Button variant="ghost" data-testid="button-back-to-blog-top">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Hero Image */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            data-testid="img-post-hero"
          />
        </div>
      </div>

      {/* Article Content */}
      <article className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="secondary" data-testid="badge-post-category">
            {post.category}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.dateISO} data-testid="text-post-date">
              {post.date}
            </time>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={sharePost}
            className="ml-auto"
            data-testid="button-share-post"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Title */}
        <h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" 
          data-testid="heading-post-title"
        >
          {post.title}
        </h1>

        {/* Excerpt */}
        <p 
          className="text-lg sm:text-xl text-muted-foreground mb-8 pb-8 border-b" 
          data-testid="text-post-excerpt"
        >
          {post.excerpt}
        </p>

        {/* Content */}
        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
          data-testid="content-post-body"
        />

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-muted-foreground">Found this helpful? Share it with others!</p>
            <Button onClick={sharePost} data-testid="button-share-bottom">
              <Share2 className="w-4 h-4 mr-2" />
              Share Post
            </Button>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-8">
          <Link href="/blog">
            <Button variant="outline" data-testid="button-back-to-blog-bottom">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Posts
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
