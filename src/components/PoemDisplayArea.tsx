
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, DownloadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CollectionItem } from '@/lib/types';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type PoemPosition = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right' | 'center';

interface PoemDisplayAreaProps {
  item: Omit<CollectionItem, 'id' | 'createdAt'>;
  onSaveToCollection: () => void;
  isPoemReady: boolean;
}

const poemPositionOptions: { value: PoemPosition; label: string }[] = [
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center', label: 'Center' },
];

export default function PoemDisplayArea({ item, onSaveToCollection, isPoemReady }: PoemDisplayAreaProps) {
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [selectedPoemPosition, setSelectedPoemPosition] = useState<PoemPosition>('bottom-left');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawImageWithPoemOnCanvas = useCallback((
    canvas: HTMLCanvasElement,
    baseImageUri: string,
    poemText: string,
    positionKey: PoemPosition
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous'; // Important for tainted canvas if image is from different origin / data URI
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let drawWidth = canvas.parentElement?.clientWidth || img.naturalWidth; // Use parent for preview sizing
      if (canvas.id === 'download-canvas-internal') drawWidth = img.naturalWidth; // Full res for download

      let drawHeight = drawWidth / aspectRatio;

      // Cap preview canvas size for performance if parent is too large
      if (canvas.id !== 'download-canvas-internal') {
        const maxPreviewHeight = (window.innerHeight * 0.5); 
        if (drawHeight > maxPreviewHeight) {
            drawHeight = maxPreviewHeight;
            drawWidth = drawHeight * aspectRatio;
        }
      }
      
      canvas.width = drawWidth;
      canvas.height = drawHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const scaleFactor = canvas.width / img.naturalWidth; // Scale factor for font and padding based on drawn image size vs original
      const baseFontSize = Math.max(12, Math.min(img.naturalWidth / 35, img.naturalHeight / 28)); // Font size based on original image
      const fontSize = baseFontSize * scaleFactor;

      ctx.font = `bold ${fontSize}px 'Literata', serif`;
      const lineHeight = fontSize * 1.3;
      const edgePadding = fontSize; 
      const textBgPadding = fontSize * 0.3;

      const originalLines = poemText.split('\\n');
      const wrappedLines: { text: string; width: number }[] = [];
      let textBlockContentWidth = 0;
      
      const maxAllowedTextWidth = canvas.width - 2 * edgePadding;

      originalLines.forEach(line => {
        if (line.trim() === "") {
          wrappedLines.push({ text: "", width: 0 });
          return;
        }
        let currentSegment = "";
        const words = line.split(" ");
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testSegment = currentSegment + (currentSegment ? " " : "") + word;
          const measuredWidth = ctx.measureText(testSegment).width;
          if (measuredWidth > maxAllowedTextWidth && currentSegment) {
            const currentSegmentWidth = ctx.measureText(currentSegment).width;
            wrappedLines.push({ text: currentSegment, width: currentSegmentWidth });
            textBlockContentWidth = Math.max(textBlockContentWidth, currentSegmentWidth);
            currentSegment = word;
          } else {
            currentSegment = testSegment;
          }
        }
        if (currentSegment) {
          const currentSegmentWidth = ctx.measureText(currentSegment).width;
          wrappedLines.push({ text: currentSegment, width: currentSegmentWidth });
          textBlockContentWidth = Math.max(textBlockContentWidth, currentSegmentWidth);
        }
      });

      if (wrappedLines.length === 0) return; // No poem to draw

      const textBlockVisibleWidth = textBlockContentWidth + 2 * textBgPadding;
      const textBlockHeight = (wrappedLines.length * lineHeight) + (2 * textBgPadding) - (lineHeight - fontSize);


      let blockX: number; 
      let blockY: number; 

      if (positionKey.includes('left')) {
        blockX = edgePadding;
      } else if (positionKey.includes('center') && !positionKey.includes('left') && !positionKey.includes('right')) { // e.g. top-center, bottom-center, center
        blockX = (canvas.width - textBlockVisibleWidth) / 2;
      } else { // right
        blockX = canvas.width - textBlockVisibleWidth - edgePadding;
      }

      if (positionKey.startsWith('top')) {
        blockY = edgePadding;
      } else if (positionKey.startsWith('bottom')) {
        blockY = canvas.height - textBlockHeight - edgePadding;
      } else { // center (middle for 'center' key)
        blockY = (canvas.height - textBlockHeight) / 2;
      }
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(blockX, blockY, textBlockVisibleWidth, textBlockHeight);

      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'top'; 
      
      wrappedLines.forEach((line, index) => {
        const textY = blockY + textBgPadding + index * lineHeight;
        let textX = blockX + textBgPadding;

        if ((positionKey.includes('center') && !positionKey.includes('left') && !positionKey.includes('right')) || positionKey === 'center') {
          ctx.textAlign = 'center';
          textX = blockX + textBlockVisibleWidth / 2;
        } else if (positionKey.includes('right')) {
          ctx.textAlign = 'right';
          textX = blockX + textBlockVisibleWidth - textBgPadding;
        } else { 
          ctx.textAlign = 'left';
        }
        ctx.fillText(line.text, textX, textY);
      });
    };
    img.src = baseImageUri;
  }, []);

  useEffect(() => {
    if (isDownloadDialogOpen && previewCanvasRef.current && item.imageDataUri && item.poem) {
      drawImageWithPoemOnCanvas(previewCanvasRef.current, item.imageDataUri, item.poem, selectedPoemPosition);
    }
  }, [isDownloadDialogOpen, item.imageDataUri, item.poem, selectedPoemPosition, drawImageWithPoemOnCanvas]);


  const handleActualDownload = () => {
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.id = 'download-canvas-internal'; // To ensure full resolution drawing
    drawImageWithPoemOnCanvas(hiddenCanvas, item.imageDataUri, item.poem, selectedPoemPosition);
    
    // Wait for image to load and draw on canvas
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { // Ensure drawing is complete
        // Re-draw on hidden canvas one more time to be sure its state is final
        drawImageWithPoemOnCanvas(hiddenCanvas, item.imageDataUri, item.poem, selectedPoemPosition);
        // Delay download slightly to ensure canvas is updated.
        setTimeout(() => {
            const dataUrl = hiddenCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `photo-poet-${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsDownloadDialogOpen(false);
        }, 300); // 300ms delay, adjust if needed
    };
    img.src = item.imageDataUri; // Trigger load
  };


  if (!item.imageDataUri || !item.poem) {
    return null;
  }

  return (
    <>
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
            <pre className="text-base leading-relaxed whitespace-pre-wrap p-4 bg-secondary/30 rounded-md font-body text-foreground min-h-[150px] max-h-[40vh] overflow-y-auto">
              {item.poem}
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" aria-label="Download image with poem">
                <DownloadCloud className="mr-2 h-4 w-4" />
                Download with Poem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Download Image with Poem</DialogTitle>
                <DialogDescription>
                  Choose where you'd like the poem to appear on your image. The preview will update below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="poem-position" className="text-right col-span-1">
                    Position
                  </Label>
                  <Select
                    value={selectedPoemPosition}
                    onValueChange={(value) => setSelectedPoemPosition(value as PoemPosition)}
                  >
                    <SelectTrigger id="poem-position" className="col-span-3">
                      <SelectValue placeholder="Select poem position" />
                    </SelectTrigger>
                    <SelectContent>
                      {poemPositionOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full aspect-video border bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                  {/* Canvas for previewing the image with poem */}
                  <canvas ref={previewCanvasRef} className="max-w-full max-h-[50vh] object-contain"></canvas>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                   <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleActualDownload}>
                  <DownloadCloud className="mr-2 h-4 w-4" /> Download Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={onSaveToCollection} className="bg-accent hover:bg-accent/90 text-accent-foreground" aria-label="Save to collection">
            <Heart className="mr-2 h-4 w-4" />
            Save to Collection
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

    