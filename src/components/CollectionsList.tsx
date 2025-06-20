'use client';

import type { CollectionItem } from '@/lib/types';
import CollectionCard from './CollectionCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, LayoutGrid } from 'lucide-react';

interface CollectionsListProps {
  collections: CollectionItem[];
  onRemoveItem: (id: string) => void;
}

export default function CollectionsList({ collections, onRemoveItem }: CollectionsListProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-border rounded-lg">
        <LayoutGrid className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold font-headline mb-2">Your Collection is Empty</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          It looks like you haven't saved any poems yet. Start creating and build your personal gallery of poetic art!
        </p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Poem
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((item) => (
        <CollectionCard key={item.id} item={item} onRemove={onRemoveItem} />
      ))}
    </div>
  );
}
