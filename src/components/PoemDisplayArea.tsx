
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, DownloadCloud, Palette, TextCursorInput, Type, Baseline } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

type PoemPosition = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right' | 'center';

interface PoemDisplayAreaProps {
  item: Omit<CollectionItem, 'id' | 'createdAt'>;
  onSaveToCollection: () => void;
  isPoemReady: boolean;
}

const poemPositionOptions: { value: PoemPosition; label: string }[] = [
  { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-center', label: 'Bottom Center' }, { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'top-left', label: 'Top Left' }, { value: 'top-center', label: 'Top Center' }, { value: 'top-right', label: 'Top Right' },
  { value: 'center', label: 'Center' },
];

const fontFamilies = [
  { value: "'Literata', serif", label: "Literata (Default)" },
  { value: "'Arial', sans-serif", label: "Arial" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "'Georgia', serif", label: "Georgia" },
  { value: "'Verdana', sans-serif", label: "Verdana" },
];

// Helper to convert hex and opacity to rgba
const hexToRgba = (hex: string, opacity: number): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) { // #RGB
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) { // #RRGGBB
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function PoemDisplayArea({ item, onSaveToCollection, isPoemReady }: PoemDisplayAreaProps) {
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Customization State
  const [selectedPoemPosition, setSelectedPoemPosition] = useState<PoemPosition>('bottom-left');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textBgColorHex, setTextBgColorHex] = useState<string>('#000000');
  const [textBgOpacity, setTextBgOpacity] = useState<number>(0.7);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1); // 1 = default, slider 0.5 to 2
  const [fontFamily, setFontFamily] = useState<string>("'Literata', serif");

  const drawImageWithPoemOnCanvas = useCallback((
    canvas: HTMLCanvasElement,
    baseImageUri: string,
    poemText: string,
    options: {
      position: PoemPosition;
      textColor: string;
      bgColor: string; // This should be an RGBA string
      fontMultiplier: number;
      fontFamily: string;
    }
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let drawWidth = canvas.parentElement?.clientWidth || img.naturalWidth; 
      if (canvas.id === 'download-canvas-internal') drawWidth = img.naturalWidth; 

      let drawHeight = drawWidth / aspectRatio;

      if (canvas.id !== 'download-canvas-internal') {
        const maxPreviewHeight = (window.innerHeight * 0.4); // Adjusted for more space for controls
        if (drawHeight > maxPreviewHeight) {
            drawHeight = maxPreviewHeight;
            drawWidth = drawHeight * aspectRatio;
        }
      }
      
      canvas.width = drawWidth;
      canvas.height = drawHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const scaleFactor = canvas.width / img.naturalWidth; 
      const baseFontSizeCalc = Math.max(10, Math.min(img.naturalWidth / 40, img.naturalHeight / 30)); // Slightly smaller base
      const fontSize = (baseFontSizeCalc * options.fontMultiplier) * scaleFactor;

      ctx.font = `bold ${fontSize}px ${options.fontFamily}`;
      const lineHeight = fontSize * 1.3;
      const edgePadding = fontSize; 
      const textBgPadding = fontSize * 0.3;

      const originalLines = poemText.split('\n'); // Use '\n' for actual newlines
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

      if (wrappedLines.length === 0) return; 

      const textBlockVisibleWidth = textBlockContentWidth + 2 * textBgPadding;
      const textBlockHeight = (wrappedLines.length * lineHeight) + (2 * textBgPadding) - (lineHeight - fontSize);

      let blockX: number; 
      let blockY: number; 

      if (options.position.includes('left')) {
        blockX = edgePadding;
      } else if (options.position.includes('center') && !options.position.includes('left') && !options.position.includes('right')) { 
        blockX = (canvas.width - textBlockVisibleWidth) / 2;
      } else { 
        blockX = canvas.width - textBlockVisibleWidth - edgePadding;
      }

      if (options.position.startsWith('top')) {
        blockY = edgePadding;
      } else if (options.position.startsWith('bottom')) {
        blockY = canvas.height - textBlockHeight - edgePadding;
      } else { 
        blockY = (canvas.height - textBlockHeight) / 2;
      }
      
      ctx.fillStyle = options.bgColor; // Use the combined RGBA color
      ctx.fillRect(blockX, blockY, textBlockVisibleWidth, textBlockHeight);

      ctx.fillStyle = options.textColor;
      ctx.textBaseline = 'top'; 
      
      wrappedLines.forEach((line, index) => {
        const textY = blockY + textBgPadding + index * lineHeight;
        let textX = blockX + textBgPadding;
        
        // Align text within its own background box
        const currentLineWidth = line.width;
        if ((options.position.includes('center') && !options.position.includes('left') && !options.position.includes('right')) || options.position === 'center') {
           ctx.textAlign = 'center';
           textX = blockX + textBlockVisibleWidth / 2;
        } else if (options.position.includes('right')) {
           ctx.textAlign = 'right';
           textX = blockX + textBlockVisibleWidth - textBgPadding;
        } else { // left
           ctx.textAlign = 'left';
        }
        ctx.fillText(line.text, textX, textY);
      });
    };
    img.src = baseImageUri;
  }, []);

  useEffect(() => {
    if (isDownloadDialogOpen && previewCanvasRef.current && item.imageDataUri && item.poem) {
      const currentBgColor = hexToRgba(textBgColorHex, textBgOpacity);
      drawImageWithPoemOnCanvas(previewCanvasRef.current, item.imageDataUri, item.poem, {
        position: selectedPoemPosition,
        textColor,
        bgColor: currentBgColor,
        fontMultiplier: fontSizeMultiplier,
        fontFamily,
      });
    }
  }, [isDownloadDialogOpen, item.imageDataUri, item.poem, selectedPoemPosition, textColor, textBgColorHex, textBgOpacity, fontSizeMultiplier, fontFamily, drawImageWithPoemOnCanvas]);


  const handleActualDownload = () => {
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.id = 'download-canvas-internal'; 
    const currentBgColor = hexToRgba(textBgColorHex, textBgOpacity);
    
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { 
        // Ensure drawing is based on final image dimensions and current settings
        drawImageWithPoemOnCanvas(hiddenCanvas, item.imageDataUri, item.poem, {
          position: selectedPoemPosition,
          textColor,
          bgColor: currentBgColor,
          fontMultiplier: fontSizeMultiplier,
          fontFamily,
        });
        setTimeout(() => { // Ensure canvas is fully rendered
            const dataUrl = hiddenCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `photo-poet-${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsDownloadDialogOpen(false);
        }, 300); 
    };
    img.src = item.imageDataUri; 
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
            <DialogContent className="sm:max-w-3xl"> {/* Increased width for more controls */}
              <DialogHeader>
                <DialogTitle>Customize & Download Image</DialogTitle>
                <DialogDescription>
                  Adjust poem appearance. The preview updates live.
                </DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 py-4">
                {/* Left Column: Preview */}
                <div className="w-full aspect-video border bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                  <canvas ref={previewCanvasRef} className="max-w-full max-h-[50vh] object-contain"></canvas>
                </div>
                {/* Right Column: Controls */}
                <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                  <div>
                    <Label htmlFor="poem-position" className="flex items-center mb-1"><Baseline className="mr-2 h-4 w-4 text-muted-foreground"/>Position</Label>
                    <Select value={selectedPoemPosition} onValueChange={(v) => setSelectedPoemPosition(v as PoemPosition)}>
                      <SelectTrigger id="poem-position"><SelectValue /></SelectTrigger>
                      <SelectContent>{poemPositionOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="text-color" className="flex items-center mb-1"><Palette className="mr-2 h-4 w-4 text-muted-foreground"/>Text Color</Label>
                      <Input id="text-color" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="p-1 h-10"/>
                    </div>
                    <div>
                      <Label htmlFor="font-family" className="flex items-center mb-1"><TextCursorInput className="mr-2 h-4 w-4 text-muted-foreground"/>Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger id="font-family"><SelectValue /></SelectTrigger>
                        <SelectContent>{fontFamilies.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bg-color" className="flex items-center mb-1"><Palette className="mr-2 h-4 w-4 text-muted-foreground"/>Background Color</Label>
                    <Input id="bg-color" type="color" value={textBgColorHex} onChange={(e) => setTextBgColorHex(e.target.value)} className="p-1 h-10"/>
                  </div>
                  
                  <div>
                    <Label htmlFor="bg-opacity" className="flex items-center mb-1">Background Opacity: {Math.round(textBgOpacity * 100)}%</Label>
                    <Slider id="bg-opacity" min={0} max={1} step={0.05} value={[textBgOpacity]} onValueChange={(v) => setTextBgOpacity(v[0])} />
                  </div>

                  <div>
                    <Label htmlFor="font-size" className="flex items-center mb-1"><Type className="mr-2 h-4 w-4 text-muted-foreground"/>Font Size Multiplier: {fontSizeMultiplier.toFixed(1)}x</Label>
                    <Slider id="font-size" min={0.5} max={2} step={0.1} value={[fontSizeMultiplier]} onValueChange={(v) => setFontSizeMultiplier(v[0])} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleActualDownload}><DownloadCloud className="mr-2 h-4 w-4" /> Download Now</Button>
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
