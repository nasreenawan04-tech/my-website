import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/data/blogData";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const estimatedReadTime = Math.ceil(post.content.split(/\s+/).length / 200);

  return (
    <Card className="hover-elevate active-elevate-2 h-full flex flex-col overflow-hidden transition-all duration-300 group border shadow-sm hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <div className="relative h-48 sm:h-52 md:h-56 lg:h-60 overflow-hidden bg-muted">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            data-testid={`img-blog-${post.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
            <Badge 
              variant="secondary" 
              className="bg-primary text-primary-foreground shadow-md border-0 px-3 py-1 text-xs sm:text-sm font-semibold" 
              data-testid={`badge-category-${post.id}`}
            >
              {post.category}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-2 sm:pb-3 pt-4 sm:pt-5 px-4 sm:px-5 lg:px-6">
          <h3 
            className="text-lg sm:text-xl lg:text-2xl font-bold line-clamp-2 mb-2 sm:mb-3 group-hover:text-primary transition-colors leading-tight" 
            data-testid={`title-blog-${post.id}`}
          >
            {post.title}
          </h3>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <time dateTime={post.dateISO} data-testid={`date-blog-${post.id}`}>
                {post.date}
              </time>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span data-testid={`readtime-blog-${post.id}`}>
                {estimatedReadTime} min read
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pt-0 px-4 sm:px-5 lg:px-6">
          <p 
            className="text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed" 
            data-testid={`excerpt-blog-${post.id}`}
          >
            {post.excerpt}
          </p>
        </CardContent>
        
        <CardFooter className="pt-0 pb-4 sm:pb-5 lg:pb-6 px-4 sm:px-5 lg:px-6">
          <span className="text-primary font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all text-sm sm:text-base" data-testid={`link-read-more-${post.id}`}>
            Read More
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
