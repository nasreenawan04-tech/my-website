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
    <Card className="hover-elevate active-elevate-2 h-full flex flex-col overflow-hidden transition-colors group">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <div className="relative h-52 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            data-testid={`img-blog-${post.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm" data-testid={`badge-category-${post.id}`}>
              {post.category}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <h3 
            className="text-xl font-bold line-clamp-2 mb-3 group-hover:text-primary transition-colors" 
            data-testid={`title-blog-${post.id}`}
          >
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.dateISO} data-testid={`date-blog-${post.id}`}>
                {post.date}
              </time>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span data-testid={`readtime-blog-${post.id}`}>
                {estimatedReadTime} min read
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pt-0">
          <p 
            className="text-muted-foreground line-clamp-3 leading-relaxed" 
            data-testid={`excerpt-blog-${post.id}`}
          >
            {post.excerpt}
          </p>
        </CardContent>
        
        <CardFooter className="pt-0">
          <span className="text-primary font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all" data-testid={`link-read-more-${post.id}`}>
            Read More
            <ArrowRight className="w-4 h-4" />
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
