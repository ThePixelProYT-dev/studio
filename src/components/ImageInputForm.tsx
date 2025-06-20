'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Camera, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageInputFormProps {
  onPoemGenerate: (imageDataUri: string) => void;
  isLoading: boolean;
}

export default function ImageInputForm({ onPoemGenerate, isLoading }: ImageInputFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file (e.g., JPG, PNG, GIF).',
          variant: 'destructive',
        });
        return;
      }
      // Max file size: 5MB (adjust as needed)
      if (file.size > 5 * 1024 * 1024) {
         toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = () => {
    if (imagePreview) {
      onPoemGenerate(imagePreview);
    } else {
      toast({
        title: 'No Image Selected',
        description: 'Please upload or select an image first.',
        variant: 'destructive',
      });
    }
  };
  
  const handleTakePhotoClick = () => {
    // Placeholder for camera functionality
     toast({
        title: 'Camera Feature',
        description: 'Taking photos directly is coming soon! For now, please upload an image.',
      });
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline text-foreground/90">Create Your Poem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-upload" className="text-base">Upload an Image</Label>
          <div
            className={cn(
              "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/70 transition-colors",
              imagePreview ? "border-primary/50" : "border-border"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); if(e.dataTransfer.files[0]) { fileInputRef.current!.files = e.dataTransfer.files; handleFileChange({ target: fileInputRef.current } as any); }}}
            onDragOver={(e) => e.preventDefault()}
          >
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload image"
            />
            {imagePreview ? (
              <div className="relative w-full h-64 rounded-md overflow-hidden">
                <Image src={imagePreview} alt="Selected preview" layout="fill" objectFit="contain" data-ai-hint="abstract texture" />
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
        </div>
        <Button 
          onClick={handleTakePhotoClick} 
          variant="outline" 
          className="w-full"
          aria-label="Take a photo"
        >
          <Camera className="mr-2 h-5 w-5" />
          Take Photo (Coming Soon)
        </Button>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateClick}
          disabled={isLoading || !imagePreview}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
          aria-label="Generate poem from image"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-6 w-6" />
          )}
          {isLoading ? 'Generating...' : 'Generate Poem'}
        </Button>
      </CardFooter>
    </Card>
  );
}
