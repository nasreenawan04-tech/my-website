import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { BlogPost } from "@/data/blogData";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="hover-elevate active-elevate-2 h-full flex flex-col overflow-hidden transition-colors">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            data-testid={`img-blog-${post.id}`}
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" data-testid={`badge-category-${post.id}`}>
              {post.category}
            </Badge>
          </div>
        </div>
        
        <CardHeader>
          <h3 
            className="text-xl font-bold line-clamp-2 mb-2" 
            data-testid={`title-blog-${post.id}`}
          >
            {post.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.dateISO} data-testid={`date-blog-${post.id}`}>
              {post.date}
            </time>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          <p 
            className="text-muted-foreground line-clamp-3" 
            data-testid={`excerpt-blog-${post.id}`}
          >
            {post.excerpt}
          </p>
        </CardContent>
        
        <CardFooter>
          <span className="text-primary font-medium hover:underline" data-testid={`link-read-more-${post.id}`}>
            Read More →
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
