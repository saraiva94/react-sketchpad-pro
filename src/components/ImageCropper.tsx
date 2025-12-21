import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload, X, Check, RotateCcw, ZoomIn, ZoomOut, Crop as CropIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ImageCropperProps {
  onImageCropped: (croppedImageBlob: Blob, previewUrl: string) => void;
  aspectRatio?: number;
  currentImage?: string | null;
  onClear?: () => void;
  allowReadjust?: boolean;
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
  allowReadjust = true
}: ImageCropperProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowCropDialog(true);
        setScale(1);
        setRotate(0);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, aspectRatio);
    setCrop(initialCrop);
    // Also set completed crop immediately so confirm works right away
    if (initialCrop) {
      const pixelCrop = {
        x: (initialCrop.x / 100) * width,
        y: (initialCrop.y / 100) * height,
        width: (initialCrop.width / 100) * width,
        height: (initialCrop.height / 100) * height,
        unit: 'px' as const,
      };
      setCompletedCrop(pixelCrop);
    }
  }, [aspectRatio]);

  const getCroppedImg = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

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
            resolve(null);
          }
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleConfirmCrop = async () => {
    console.log('[ImageCropper] handleConfirmCrop called');
    console.log('[ImageCropper] completedCrop:', completedCrop);
    console.log('[ImageCropper] imgRef.current:', imgRef.current);
    
    const result = await getCroppedImg();
    console.log('[ImageCropper] getCroppedImg result:', result);
    
    if (result) {
      onImageCropped(result.blob, result.url);
      setShowCropDialog(false);
      setImageSrc('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } else {
      console.error('[ImageCropper] Failed to crop image - result is null');
    }
  };

  const handleCancel = () => {
    setShowCropDialog(false);
    setImageSrc('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClearImage = () => {
    if (onClear) {
      onClear();
    }
  };

  const handleReadjust = () => {
    if (currentImage) {
      setImageSrc(currentImage);
      setShowCropDialog(true);
      setScale(1);
      setRotate(0);
    }
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
                    >
                      <CropIcon className="w-3 h-3 mr-1" />
                      Reajustar
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
              Recomendado: 16:9 (1920x1080)
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
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajustar Imagem de Capa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Crop Area with dashed border style */}
            <div className="flex justify-center bg-muted rounded-lg p-4 overflow-hidden">
              {imageSrc && (
                <div className="relative crop-dashed-style">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatio}
                    className="max-h-[450px]"
                  >
                    <img
                      ref={imgRef}
                      alt="Imagem para recortar"
                      src={imageSrc}
                      style={{ 
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        maxHeight: '450px',
                        width: 'auto'
                      }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                  {/* Label overlay */}
                  {crop && (
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
                          Área visível na página
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
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmCrop}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar
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
