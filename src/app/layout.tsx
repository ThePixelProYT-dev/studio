import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Photo Poet',
  description: 'Generate poems from your photos with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
            <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
              <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                Built with love by AI.
              </p>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
