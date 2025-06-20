'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, Eye } from 'lucide-react';
import type { CollectionItem } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from 'date-fns';

interface CollectionCardProps {
  item: CollectionItem;
  onRemove: (id: string) => void;
  // onEdit: (item: CollectionItem) => void; // Future edit functionality
}

export default function CollectionCard({ item, onRemove }: CollectionCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-lg truncate text-primary-foreground bg-primary/80 p-2 rounded-md">
          {item.title || `Poem - ${format(new Date(item.createdAt), "PP")}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3">
        <div className="relative w-full aspect-video rounded-md overflow-hidden border">
          <Image src={item.imageDataUri} alt={item.title || "Collected image"} layout="fill" objectFit="cover" data-ai-hint="gallery art" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap font-body">
          {item.poem}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" aria-label="View poem details">
              <Eye className="mr-1.5 h-4 w-4" /> View
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{item.title || "Poetic Creation"}</DialogTitle>
              <DialogDescription>
                Created on {format(new Date(item.createdAt), "PPP p")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md">
                <Image src={item.imageDataUri} alt={item.title || "Collected image"} layout="fill" objectFit="contain" data-ai-hint="detail view" />
              </div>
              <pre className="text-sm leading-relaxed whitespace-pre-wrap p-3 bg-secondary/30 rounded-md font-body text-foreground overflow-y-auto">
                {item.poem}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="flex gap-2">
          {/* <Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label="Edit poem title">
            <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </Button> */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Delete poem">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this poetic creation from your collection.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRemove(item.id)} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
