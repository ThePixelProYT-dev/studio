
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Camera, Loader2, Wand2, Aperture, XCircle, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImageInputFormProps {
  onPoemGenerate: (imageDataUri: string) => void;
  isLoading: boolean;
}

export default function ImageInputForm({ onPoemGenerate, isLoading }: ImageInputFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // Keep track of the file for potential future use
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const [showCameraView, setShowCameraView] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);


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
      setShowCameraView(false); // Ensure camera view is closed
    }
  };

  const handleGenerateClick = () => {
    if (imagePreview) {
      onPoemGenerate(imagePreview);
    } else {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image or capture one first.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleCameraView = () => {
    if (!showCameraView) {
      setShowCameraView(true);
      // Permission request will be handled by useEffect
    } else {
      setShowCameraView(false);
      setHasCameraPermission(null);
      setCameraError(null);
    }
  };
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    const videoElement = videoRef.current;

    const startCamera = async () => {
      if (videoElement) {
        setHasCameraPermission(null); // Reset while trying
        setCameraError(null);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            videoElement.play().catch(playError => {
              console.error("Error playing video:", playError);
              setCameraError("Could not start camera preview.");
              setHasCameraPermission(false);
            });
          };
        } catch (error: any) {
          console.error('Error accessing camera:', error);
          const permissionError = error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.name === 'NotFoundError';
          const userDenied = error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError';
          
          let errorMsg = 'Could not access the camera.';
          if (userDenied) {
            errorMsg = 'Camera permission was denied. Please enable it in your browser settings.';
          } else if (error.name === 'NotFoundError') {
            errorMsg = 'No camera found. Please ensure a camera is connected and enabled.';
          }

          setCameraError(errorMsg);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Error',
            description: errorMsg,
          });
          setShowCameraView(false); // Hide camera view on critical error
        }
      }
    };

    if (showCameraView) {
      startCamera();
    }

    return () => { // Cleanup function
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [showCameraView, toast]);


  const handleCapturePhoto = useCallback(() => {
    if (videoRef.current && hasCameraPermission) {
      setIsCapturing(true);
      const videoNode = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = videoNode.videoWidth;
      canvas.height = videoNode.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoNode, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setImagePreview(dataUri);
        setImageFile(null); // Clear file if one was previously selected
        setShowCameraView(false); // Switch back to preview/upload view
        setHasCameraPermission(null); // Reset camera permission status
        setCameraError(null);
      } else {
         toast({title: 'Capture Error', description: 'Could not process image.', variant: 'destructive'});
      }
      setIsCapturing(false);
    }
  }, [hasCameraPermission, toast]);


  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline text-foreground/90">Create Your Poem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showCameraView ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden border bg-muted flex items-center justify-center">
              <video ref={videoRef} className={cn("w-full h-full object-cover", {"hidden": !hasCameraPermission})} autoPlay muted playsInline aria-label="Camera feed" />
              {hasCameraPermission === null && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-10 h-10 animate-spin mb-2" />
                  <p>Requesting camera access...</p>
                </div>
              )}
              {hasCameraPermission === false && cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4 text-center">
                  <CameraOff className="w-12 h-12 mb-2" />
                  <p>{cameraError}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCapturePhoto} disabled={!hasCameraPermission || isLoading || isCapturing} className="flex-1">
                {isCapturing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Aperture className="mr-2 h-5 w-5" />}
                Capture Photo
              </Button>
              <Button variant="outline" onClick={handleToggleCameraView} className="flex-1">
                <XCircle className="mr-2 h-5 w-5" /> Cancel
              </Button>
            </div>
            {cameraError && hasCameraPermission === false && (
               <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Camera Issue</AlertTitle>
                  <AlertDescription>{cameraError}</AlertDescription>
               </Alert>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-base">Upload an Image</Label>
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/70 transition-colors",
                  imagePreview ? "border-primary/50" : "border-border"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); if(e.dataTransfer.files && e.dataTransfer.files[0]) { fileInputRef.current!.files = e.dataTransfer.files; handleFileChange({ target: fileInputRef.current } as any); }}}
                onDragOver={(e) => e.preventDefault()}
                role="button"
                tabIndex={0}
                aria-label="Image upload area"
              >
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
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
              onClick={handleToggleCameraView}
              variant="outline"
              className="w-full"
              aria-label="Take a photo with camera"
            >
              <Camera className="mr-2 h-5 w-5" />
              Take Photo
            </Button>
          </>
        )}
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

    