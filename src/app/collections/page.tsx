'use client';

import { useState, useEffect } from 'react';
import CollectionsList from '@/components/CollectionsList';
import { getCollections, removeCollectionItem as removeStoredCollectionItem } from '@/lib/collection-store';
import type { CollectionItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setCollections(getCollections());
  }, []);

  const handleRemoveItem = (id: string) => {
    removeStoredCollectionItem(id);
    setCollections(getCollections()); // Re-fetch to update UI
    toast({
      title: "Poem Removed",
      description: "The item has been removed from your collection.",
    });
  };

  if (!isClient) {
    // Render a placeholder or skeleton while waiting for client-side mount
    // This avoids hydration errors from localStorage access
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold font-headline text-center text-primary">My Poetic Collections</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary-foreground">
        My Poetic Collections
      </h1>
      <p className="text-lg text-center text-muted-foreground max-w-2xl mx-auto">
        Revisit your cherished creations. Each image and poem pair, a unique moment captured in verse.
      </p>
      <CollectionsList collections={collections} onRemoveItem={handleRemoveItem} />
    </div>
  );
}
