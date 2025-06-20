'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Download } from 'lucide-react'; // Using Heart for save
import { cn } from '@/lib/utils';
import type { CollectionItem } from '@/lib/types';

interface PoemDisplayAreaProps {
  item: Omit<CollectionItem, 'id' | 'createdAt'>; // Accepts imageDataUri and poem
  onSaveToCollection: () => void;
  isPoemReady: boolean;
}

export default function PoemDisplayArea({ item, onSaveToCollection, isPoemReady }: PoemDisplayAreaProps) {
  if (!item.imageDataUri || !item.poem) {
    return null;
  }

  const handleDownloadImage = () => {
    if (!item.imageDataUri) return;
    const link = document.createElement('a');
    link.href = item.imageDataUri;
    // Generate a simple filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `photo-poet-${timestamp}.png`; // Assuming png, might need to infer from data URI
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={cn("w-full mx-auto shadow-xl mt-8 transition-opacity duration-700 ease-in-out", isPoemReady ? "opacity-100" : "opacity-0")}>
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline text-foreground/90">Your Poetic Creation</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6 items-start">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md">
          <Image src={item.imageDataUri} alt="User's inspiration" layout="fill" objectFit="cover" data-ai-hint="artistic photo" />
        </div>
        <div className={cn("space-y-4 animate-fade-in", { 'opacity-0': !isPoemReady })}>
          <h3 className="text-xl font-semibold font-headline text-primary-foreground bg-primary/80 p-3 rounded-md shadow">Generated Poem:</h3>
          <pre className="text-base leading-relaxed whitespace-pre-wrap p-4 bg-secondary/30 rounded-md font-body text-foreground min-h-[150px]">
            {item.poem}
          </pre>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="outline" onClick={handleDownloadImage} aria-label="Download image">
          <Download className="mr-2 h-4 w-4" />
          Download Image
        </Button>
        <Button onClick={onSaveToCollection} className="bg-accent hover:bg-accent/90 text-accent-foreground" aria-label="Save to collection">
          <Heart className="mr-2 h-4 w-4" />
          Save to Collection
        </Button>
      </CardFooter>
    </Card>
  );
}
