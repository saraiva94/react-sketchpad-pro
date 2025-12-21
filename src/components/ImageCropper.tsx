import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Upload, X, Check, RotateCcw, ZoomIn, ZoomOut, Crop as CropIcon, Move } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Aspect ratios that match the actual display dimensions
// Hero: we render as aspect-[3/1]
// Card: we render as aspect-video (16:9)
const HERO_ASPECT_RATIO = 3;
const CARD_ASPECT_RATIO = 16 / 9;

interface ImageCropperProps {
  onImageCropped: (croppedImageBlob: Blob, previewUrl: string) => void;
  aspectRatio?: number;
  currentImage?: string | null;
  onClear?: () => void;
  allowReadjust?: boolean;
  mode?: 'hero' | 'card' | 'both';
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export const ImageCropper = ({ 
  onImageCropped, 
  aspectRatio = 16 / 9, 
  currentImage,
  onClear,
  allowReadjust = true,
  mode = 'both'
}: ImageCropperProps) => {
  const { toast } = useToast();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [activeTab, setActiveTab] = useState<'hero' | 'card'>(mode === 'card' ? 'card' : 'hero');
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the current aspect ratio based on mode/tab
  const getCurrentAspectRatio = useCallback(() => {
    if (mode === 'card') return CARD_ASPECT_RATIO;
    if (mode === 'hero') return HERO_ASPECT_RATIO;
    return activeTab === 'hero' ? HERO_ASPECT_RATIO : CARD_ASPECT_RATIO;
  }, [mode, activeTab]);

  // Update crop when tab changes
  useEffect(() => {
    if (imgRef.current && imageSrc && showCropDialog) {
      const { width, height } = imgRef.current;
      if (width > 0 && height > 0) {
        const newAspect = getCurrentAspectRatio();
        const newCrop = centerAspectCrop(width, height, newAspect);
        setCrop(newCrop);
        // Convert percentage crop to pixel crop
        const pixelCrop: PixelCrop = {
          x: (newCrop.x / 100) * width,
          y: (newCrop.y / 100) * height,
          width: (newCrop.width / 100) * width,
          height: (newCrop.height / 100) * height,
          unit: 'px',
        };
        setCompletedCrop(pixelCrop);
      }
    }
  }, [activeTab, getCurrentAspectRatio, imageSrc, showCropDialog]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowCropDialog(true);
        setScale(1);
        setRotate(0);
        setActiveTab(mode === 'card' ? 'card' : 'hero');
        // Reset crop states
        setCrop(undefined);
        setCompletedCrop(undefined);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const targetAspect = getCurrentAspectRatio();
    const initialCrop = centerAspectCrop(width, height, targetAspect);
    setCrop(initialCrop);
    
    // Convert percentage crop to pixel crop for completedCrop
    const pixelCrop: PixelCrop = {
      x: (initialCrop.x / 100) * width,
      y: (initialCrop.y / 100) * height,
      width: (initialCrop.width / 100) * width,
      height: (initialCrop.height / 100) * height,
      unit: 'px',
    };
    setCompletedCrop(pixelCrop);
  }, [getCurrentAspectRatio]);

  const getCroppedImg = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (!completedCrop || !imgRef.current) {
      console.error('[ImageCropper] Missing completedCrop or imgRef', { completedCrop, imgRef: imgRef.current });
      return null;
    }

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[ImageCropper] Could not get canvas context');
      return null;
    }

    const pixelRatio = window.devicePixelRatio;
    
    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    const rotateRads = rotate * (Math.PI / 180);
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0);

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({ blob, url });
          } else {
            console.error('[ImageCropper] Canvas toBlob returned null');
            resolve(null);
          }
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleConfirmCrop = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    console.log('[ImageCropper] Starting crop confirmation...', { completedCrop });

    try {
      const result = await getCroppedImg();

      if (result) {
        console.log('[ImageCropper] Crop successful, calling onImageCropped');
        onImageCropped(result.blob, result.url);

        toast({
          title: 'Imagem confirmada',
          description: 'O recorte foi aplicado ao formulário.',
        });

        setShowCropDialog(false);
        setImageSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      } else {
        console.error('[ImageCropper] getCroppedImg returned null');
        toast({
          variant: 'destructive',
          title: 'Não foi possível confirmar',
          description: 'Tente reajustar novamente ou trocar a imagem.',
        });
      }
    } catch (error) {
      console.error('[ImageCropper] Error during crop:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao confirmar imagem',
        description: 'Tente trocar a imagem e repetir o recorte.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setShowCropDialog(false);
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClearImage = () => {
    if (onClear) {
      onClear();
    }
  };

  const handleReadjust = async () => {
    if (!currentImage) return;

    setIsProcessing(true);
    try {
      // Convert external URL to data URL to avoid CORS/tainted canvas issues.
      // If fetch fails (CORS), we show a clear message instead of failing silently.
      if (currentImage.startsWith('http')) {
        const response = await fetch(currentImage, { mode: 'cors', credentials: 'omit' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = () => {
          setImageSrc(reader.result as string);
          setShowCropDialog(true);
          setScale(1);
          setRotate(0);
          setActiveTab(mode === 'card' ? 'card' : 'hero');
          setIsProcessing(false);
        };

        reader.onerror = () => {
          console.error('[ImageCropper] Failed to convert image to base64');
          toast({
            variant: 'destructive',
            title: 'Não foi possível carregar para reajuste',
            description: 'Clique em “Trocar” e envie a imagem novamente.',
          });
          setIsProcessing(false);
        };

        reader.readAsDataURL(blob);
      } else {
        // Already a data URL
        setImageSrc(currentImage);
        setShowCropDialog(true);
        setScale(1);
        setRotate(0);
        setActiveTab(mode === 'card' ? 'card' : 'hero');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('[ImageCropper] Error loading image for readjust:', error);
      toast({
        variant: 'destructive',
        title: 'Não foi possível reajustar',
        description: 'Clique em “Trocar” e envie a imagem novamente.',
      });
      setIsProcessing(false);
    }
  };

  const handleCropChange = (_: Crop, percentCrop: Crop) => {
    setCrop(percentCrop);
  };

  const handleCropComplete = (c: PixelCrop) => {
    console.log('[ImageCropper] Crop completed:', c);
    setCompletedCrop(c);
  };

  return (
    <>
      <div className="space-y-3">
        {currentImage ? (
          <div className="relative">
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/30 bg-muted">
              <img 
                src={currentImage} 
                alt="Thumbnail do projeto" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                <span className="text-xs text-white/80">Imagem de capa</span>
                <div className="flex gap-2">
                  {allowReadjust && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleReadjust}
                      className="h-7 text-xs"
                      disabled={isProcessing}
                    >
                      <CropIcon className="w-3 h-3 mr-1" />
                      {isProcessing ? 'Carregando...' : 'Reajustar'}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    className="h-7 text-xs"
                  >
                    Trocar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleClearImage}
                    className="h-7 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto text-primary/60 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              Clique para adicionar imagem de capa
            </p>
            <p className="text-xs text-muted-foreground">
              Esta imagem aparecerá como thumbnail do seu projeto
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Recomendado: 1920x640 (Banner) ou 1920x1080 (Card)
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="hidden"
        />
      </div>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajustar Imagem de Capa</DialogTitle>
            <DialogDescription>
              Posicione a área pontilhada para escolher o enquadramento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tab selector for mode when mode is 'both' */}
            {mode === 'both' && (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'hero' | 'card')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="hero" className="flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    Banner (Hero)
                  </TabsTrigger>
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CropIcon className="w-4 h-4" />
                    Card
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="text-center p-2 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {(mode === 'hero' || (mode === 'both' && activeTab === 'hero')) ? (
                  <>
                    <strong>Banner horizontal (3:1):</strong> igual ao cabeçalho da página do projeto
                  </>
                ) : (
                  <>
                    <strong>Card do projeto (16:9):</strong> igual ao card de listagem
                  </>
                )}
              </p>
            </div>

            {/* Crop Area with dashed border style */}
            <div className="flex justify-center bg-muted rounded-lg p-4 overflow-hidden">
              {imageSrc && (
                <div className="relative crop-dashed-style">
                  <ReactCrop
                    crop={crop}
                    onChange={handleCropChange}
                    onComplete={handleCropComplete}
                    aspect={getCurrentAspectRatio()}
                    keepSelection={true}
                    className="max-h-[400px]"
                  >
                    <img
                      ref={imgRef}
                      alt="Imagem para recortar"
                      src={imageSrc}
                      crossOrigin="anonymous"
                      style={{ 
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        maxHeight: '400px',
                        width: 'auto'
                      }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                  {/* Label overlay */}
                  {crop && crop.width > 0 && (
                    <div 
                      className="absolute pointer-events-none z-10"
                      style={{
                        top: `calc(${crop.y}% + 8px)`,
                        left: `${crop.x}%`,
                        width: `${crop.width}%`,
                      }}
                    >
                      <div className="flex justify-center">
                        <span className="text-xs text-white bg-black/60 px-2 py-1 rounded whitespace-nowrap">
                          {(mode === 'hero' || (mode === 'both' && activeTab === 'hero')) 
                            ? 'Área do Banner (3:1)' 
                            : 'Área do Card (16:9)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              {/* Zoom */}
              <div className="flex items-center gap-4">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[scale]}
                  onValueChange={(values) => setScale(values[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.round(scale * 100)}%
                </span>
              </div>

              {/* Rotate */}
              <div className="flex items-center gap-4">
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[rotate]}
                  onValueChange={(values) => setRotate(values[0])}
                  min={-180}
                  max={180}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {rotate}°
                </span>
              </div>

              {/* Reset */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setScale(1);
                  setRotate(0);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar Ajustes
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Arraste a área pontilhada para escolher a melhor posição. 
              Use os cantos para redimensionar.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isProcessing}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirmCrop} 
              disabled={isProcessing || !completedCrop}
            >
              <Check className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom styles for dashed crop border */}
      <style>{`
        .crop-dashed-style .ReactCrop__crop-selection {
          border: 2px dashed rgba(255, 255, 255, 0.9) !important;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
        }
        .crop-dashed-style .ReactCrop__drag-handle {
          background-color: white !important;
          border: 2px solid rgba(0, 0, 0, 0.5) !important;
          width: 12px !important;
          height: 12px !important;
        }
        .crop-dashed-style .ReactCrop__drag-handle::after {
          display: none !important;
        }
      `}</style>
    </>
  );
};
