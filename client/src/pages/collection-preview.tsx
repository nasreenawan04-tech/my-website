import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { tools } from "@/data/tools";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Share2, Plus, LayoutGrid, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";

// Mock function for fetching collection details - in a real app this would call an API
const fetchCollection = async (shareId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demonstration, we'll return a collection based on the shareId
  // If shareId is 'popular', return popular tools, otherwise a random mix
  const selectedTools = shareId === 'popular' 
    ? tools.filter(t => t.isPopular)
    : tools.slice(0, 5);
    
  return {
    id: shareId,
    name: shareId === 'popular' ? "Popular Productivity Tools" : "My Favorite Tools Collection",
    description: "A handpicked selection of useful calculators and text processing tools for daily use.",
    createdBy: "Anonymous User",
    createdAt: new Date().toLocaleDateString(),
    tools: selectedTools
  };
};

export default function CollectionPreview() {
  const [, params] = useRoute("/share/:shareId");
  const shareId = params?.shareId;
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  const { data: collection, isLoading, error } = useQuery({
    queryKey: ["/api/collections", shareId],
    queryFn: () => fetchCollection(shareId || ""),
    enabled: !!shareId
  });

  const handleImportAll = () => {
    if (!collection) return;
    
    let importedCount = 0;
    collection.tools.forEach(tool => {
      if (!isFavorite(tool.id)) {
        toggleFavorite(tool);
        importedCount++;
      }
    });

    toast({
      title: importedCount > 0 ? "Tools Imported!" : "No new tools to import",
      description: importedCount > 0 
        ? `Successfully added ${importedCount} tools to your favorites.` 
        : "All tools from this collection are already in your favorites.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Collection Not Found</h2>
        <p className="text-muted-foreground">The shared collection you're looking for doesn't exist or has been removed.</p>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Helmet>
        <title>{collection.name} - DapsiWow Shared Collection</title>
        <meta name="description" content={collection.description} />
      </Helmet>

      <div className="mb-8 space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/all-tools">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to All Tools
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">Shared Collection</Badge>
              <span className="text-xs text-muted-foreground">Created on {collection.createdAt}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{collection.name}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {collection.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Collection
            </Button>
            <Button size="sm" className="gap-2" onClick={handleImportAll}>
              <Download className="h-4 w-4" />
              Import to Favorites
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collection.tools.map((tool) => (
          <Card key={tool.id} className="group hover-elevate border-muted/50 transition-all duration-300">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                  <i className={`${tool.icon} text-xl`} />
                </div>
                {tool.isPopular && (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-none">Popular</Badge>
                )}
              </div>
              <CardTitle className="text-xl mt-2">{tool.name}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{tool.category}</Badge>
                {tool.canCompare && (
                  <Badge variant="outline" className="text-blue-600 bg-blue-50/50">Compare Ready</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild className="w-full justify-between group-hover:bg-primary transition-all">
                <Link href={tool.href}>
                  Try Tool
                  <LayoutGrid className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20 text-center space-y-4">
        <h3 className="text-xl font-semibold">Want to create your own collection?</h3>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Sign up for a free account to save your favorite tools, create custom presets, and share your own handpicked tool collections with others.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="default">
            <Link href="/signup">Get Started for Free</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/about-us">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
