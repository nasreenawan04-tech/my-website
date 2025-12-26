import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { tools } from "@/data/tools";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Share2, Plus, LayoutGrid, Download, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useFavorites } from "@/hooks/use-favorites";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CollectionData {
  id: number;
  shareId: string;
  name: string;
  toolIds: string[];
}

export default function CollectionPreview() {
  const [, params] = useRoute("/share/:shareId");
  const shareId = params?.shareId;
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  const { data: collection, isLoading, error } = useQuery<CollectionData>({
    queryKey: [`/api/collections/${shareId}`],
    enabled: !!shareId,
    retry: false
  });

  const collectionTools = collection 
    ? tools.filter(t => collection.toolIds.includes(t.id))
    : [];

  const handleImportAll = () => {
    if (!collectionTools.length) return;
    
    let importedCount = 0;
    collectionTools.forEach(tool => {
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
      <div className="container mx-auto px-4 py-8 space-y-8" data-testid="status-loading">
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
      <div className="container mx-auto px-4 py-16 text-center space-y-6" data-testid="status-error">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Collection Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The shared collection you're looking for doesn't exist, has been removed, or the link is incorrect.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button asChild variant="default">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/all-tools">Explore All Tools</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" data-testid="container-collection-preview">
      <Helmet>
        <title>{collection.name} - DapsiWow Shared Collection</title>
        <meta name="description" content={`Check out this collection of ${collectionTools.length} tools on DapsiWow.`} />
      </Helmet>

      <div className="mb-8 space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground" data-testid="link-back-to-tools">
          <Link href="/all-tools">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to All Tools
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">Shared Collection</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-collection-name">{collection.name}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              A handpicked selection of {collectionTools.length} tools for you to use.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2" onClick={handleImportAll} data-testid="button-import-collection">
              <Download className="h-4 w-4" />
              Import to Favorites
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collectionTools.map((tool) => (
          <Card key={tool.id} className="group hover-elevate border-muted/50 transition-all duration-300" data-testid={`card-tool-${tool.id}`}>
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
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild className="w-full justify-between group-hover:bg-primary transition-all" data-testid={`link-try-tool-${tool.id}`}>
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
          <Button asChild variant="default" data-testid="link-signup">
            <Link href="/signup">Get Started for Free</Link>
          </Button>
          <Button asChild variant="ghost" data-testid="link-about">
            <Link href="/about-us">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
