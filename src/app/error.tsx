'use client';

import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center space-y-6 p-4 text-center">
      <TriangleAlert className="h-16 w-16 text-destructive" />
      <h2 className="text-3xl font-bold font-headline text-destructive">Oops! Something went wrong.</h2>
      <p className="max-w-md text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={() => reset()} variant="default" size="lg">
        Try Again
      </Button>
    </div>
  );
}
