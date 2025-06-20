'use client';

import { useState } from 'react';
import ImageInputForm from '@/components/ImageInputForm';
import PoemDisplayArea from '@/components/PoemDisplayArea';
import { generatePoemFromImage } from '@/ai/flows/generate-poem-from-image';
import { useToast } from '@/hooks/use-toast';
import type { CollectionItem } from '@/lib/types';
import { saveCollectionItem } from '@/lib/collection-store';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPoemItem, setCurrentPoemItem] = useState<Omit<CollectionItem, 'id' | 'createdAt'> | null>(null);
  const [isPoemReady, setIsPoemReady] = useState(false);
  const { toast } = useToast();

  const handlePoemGenerate = async (imageDataUri: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentPoemItem(null);
    setIsPoemReady(false);

    try {
      const result = await generatePoemFromImage({ imageDataUri });
      setCurrentPoemItem({ imageDataUri, poem: result.poem });
      // Delay making poem visible to allow animation to be noticeable
      setTimeout(() => setIsPoemReady(true), 100);
    } catch (err) {
      console.error('Failed to generate poem:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate poem. ${errorMessage}`);
      toast({
        title: 'Error Generating Poem',
        description: `Could not generate a poem for your image. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToCollection = () => {
    if (currentPoemItem) {
      const newItem: CollectionItem = {
        id: crypto.randomUUID(),
        ...currentPoemItem,
        createdAt: new Date().toISOString(),
      };
      saveCollectionItem(newItem);
      toast({
        title: 'Poem Saved!',
        description: 'Your creation has been saved to your collection.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary-foreground">
        Welcome to Photo Poet
      </h1>
      <p className="text-lg text-center text-muted-foreground max-w-2xl">
        Transform your photos into beautiful poems with the magic of AI. Upload an image and let your creativity flow.
      </p>
      
      <ImageInputForm onPoemGenerate={handlePoemGenerate} isLoading={isLoading} />

      {error && (
        <Alert variant="destructive" className="w-full max-w-lg mx-auto">
          <AlertTitle>Generation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentPoemItem && (
        <PoemDisplayArea
          item={currentPoemItem}
          onSaveToCollection={handleSaveToCollection}
          isPoemReady={isPoemReady}
        />
      )}

      {!isLoading && !currentPoemItem && (
         <Alert className="w-full max-w-lg mx-auto border-accent/50 bg-accent/10">
          <Lightbulb className="h-5 w-5 text-accent" />
          <AlertTitle className="font-headline text-accent">Ready to be inspired?</AlertTitle>
          <AlertDescription className="text-accent/80">
            Upload an image using the form above to start generating your unique poem.
            Let your visual stories turn into lyrical verses!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
