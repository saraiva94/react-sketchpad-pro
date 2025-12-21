import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Upload, X, Check, RotateCcw, ZoomIn, ZoomOut, Crop as CropIcon, Move, Image } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Aspect ratios that match the actual display dimensions
const HERO_ASPECT_RATIO = 21 / 4; // 21:4 (~5.25:1) for hero banner - matches the wide cinematic header
const CARD_ASPECT_RATIO = 16 / 9; // 16:9 for card

interface CroppedImages {
  hero: { blob: Blob; url: string } | null;
  card: { blob: Blob; url: string } | null;
}

interface DualImageCropperProps {
  onImagesCropped: (heroBlob: Blob | null, heroUrl: string | null, cardBlob: Blob | null, cardUrl: string | null, originalBlob?: Blob | null) => void;
  currentHeroImage?: string | null;
  currentCardImage?: string | null;
  originalImageUrl?: string | null; // The full uncropped original image for readjustments
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

export const DualImageCropper = ({ 
  onImagesCropped, 
  currentHeroImage,
  currentCardImage,
  originalImageUrl,
  onClear,
  allowReadjust = true,
}: DualImageCropperProps) => {
  const { toast } = useToast();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [activeTab, setActiveTab] = useState<'hero' | 'card'>('hero');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pan state for moving the image when zoomed
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Store cropped results for both
  const [croppedImages, setCroppedImages] = useState<CroppedImages>({ hero: null, card: null });
  const [heroPreview, setHeroPreview] = useState<string | null>(currentHeroImage || null);
  const [cardPreview, setCardPreview] = useState<string | null>(currentCardImage || null);
  
  // Store the original image for readjustments (not the cropped one)
  const [storedOriginalSrc, setStoredOriginalSrc] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with external props
  useEffect(() => {
    setHeroPreview(currentHeroImage || null);
  }, [currentHeroImage]);
  
  useEffect(() => {
    setCardPreview(currentCardImage || null);
  }, [currentCardImage]);

  const getCurrentAspectRatio = useCallback(() => {
    return activeTab === 'hero' ? HERO_ASPECT_RATIO : CARD_ASPECT_RATIO;
  }, [activeTab]);

  // Update crop when tab changes
  useEffect(() => {
    if (imgRef.current && imageSrc && showCropDialog) {
      const { width, height } = imgRef.current;
      if (width > 0 && height > 0) {
        const newAspect = getCurrentAspectRatio();
        const newCrop = centerAspectCrop(width, height, newAspect);
        setCrop(newCrop);
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

  // Pan handlers for moving the image
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return; // Only allow panning when zoomed in
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
  }, [scale, panX, panY]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || scale <= 1) return;
    e.preventDefault();
    const newPanX = e.clientX - panStart.x;
    const newPanY = e.clientY - panStart.y;
    // Limit pan range based on scale
    const maxPan = (scale - 1) * 200;
    setPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
    setPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
  }, [isPanning, scale, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const dataUrl = reader.result?.toString() || '';
        setImageSrc(dataUrl);
        // Store the original image for future readjustments
        setStoredOriginalSrc(dataUrl);
        setShowCropDialog(true);
        setScale(1);
        setRotate(0);
        setPanX(0);
        setPanY(0);
        setActiveTab('hero');
        setCrop(undefined);
        setCompletedCrop(undefined);
        // Reset cropped images when starting fresh
        setCroppedImages({ hero: null, card: null });
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const targetAspect = getCurrentAspectRatio();
    const initialCrop = centerAspectCrop(width, height, targetAspect);
    setCrop(initialCrop);
    
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
      console.error('[DualImageCropper] Missing completedCrop or imgRef');
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

    // Adjust crop position based on pan offset
    const cropX = (completedCrop.x - panX / scale) * scaleX;
    const cropY = (completedCrop.y - panY / scale) * scaleY;

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

  const handleSaveCrop = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await getCroppedImg();
      
      if (result) {
        const newCroppedImages = { ...croppedImages };
        
        if (activeTab === 'hero') {
          newCroppedImages.hero = result;
          setHeroPreview(result.url);
          setCroppedImages(newCroppedImages);
          
          toast({
            title: 'Banner salvo',
            description: 'Agora ajuste o recorte do Card.',
          });
          
          // Switch to card tab
          setActiveTab('card');
        } else {
          newCroppedImages.card = result;
          setCardPreview(result.url);
          setCroppedImages(newCroppedImages);
          
          // Both done - call the callback and close
          const heroData = newCroppedImages.hero;
          const cardData = newCroppedImages.card;
          
          onImagesCropped(
            heroData?.blob || null,
            heroData?.url || heroPreview,
            cardData?.blob || null,
            cardData?.url || cardPreview
          );
          
          toast({
            title: 'Imagens confirmadas',
            description: 'Banner e Card salvos com sucesso.',
          });
          
          setShowCropDialog(false);
          setImageSrc('');
          setCrop(undefined);
          setCompletedCrop(undefined);
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar',
          description: 'Tente ajustar novamente.',
        });
      }
    } catch (error) {
      console.error('[DualImageCropper] Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao processar imagem',
        description: 'Tente novamente.',
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
    setCroppedImages({ hero: null, card: null });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClearImages = () => {
    setHeroPreview(null);
    setCardPreview(null);
    setCroppedImages({ hero: null, card: null });
    if (onClear) {
      onClear();
    }
  };

  const handleReadjust = async () => {
    // Priority: stored original > prop original > hero > card
    const imageToUse = storedOriginalSrc || originalImageUrl || currentHeroImage || currentCardImage;
    if (!imageToUse) return;

    setIsProcessing(true);
    try {
      // If it's a data URL (stored original), use it directly
      if (imageToUse.startsWith('data:')) {
        setImageSrc(imageToUse);
        setShowCropDialog(true);
        setScale(1);
        setRotate(0);
        setPanX(0);
        setPanY(0);
        setActiveTab('hero');
        setCroppedImages({ hero: null, card: null });
        setIsProcessing(false);
        return;
      }
      
      // If it's a URL, fetch it
      if (imageToUse.startsWith('http')) {
        const response = await fetch(imageToUse, { mode: 'cors', credentials: 'omit' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setImageSrc(dataUrl);
          // Store for future readjustments
          setStoredOriginalSrc(dataUrl);
          setShowCropDialog(true);
          setScale(1);
          setRotate(0);
          setPanX(0);
          setPanY(0);
          setActiveTab('hero');
          setCroppedImages({ hero: null, card: null });
          setIsProcessing(false);
        };
        
        reader.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'Não foi possível carregar',
            description: 'Clique em "Trocar" e envie a imagem novamente.',
          });
          setIsProcessing(false);
        };
        
        reader.readAsDataURL(blob);
      } else {
        setImageSrc(imageToUse);
        setStoredOriginalSrc(imageToUse);
        setShowCropDialog(true);
        setScale(1);
        setRotate(0);
        setPanX(0);
        setPanY(0);
        setActiveTab('hero');
        setCroppedImages({ hero: null, card: null });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('[DualImageCropper] Error loading:', error);
      toast({
        variant: 'destructive',
        title: 'Não foi possível reajustar',
        description: 'Clique em "Trocar" e envie a imagem novamente.',
      });
      setIsProcessing(false);
    }
  };

  const hasAnyImage = heroPreview || cardPreview;

  return (
    <>
      <div className="space-y-4">
        {hasAnyImage ? (
          <div className="space-y-3">
            {/* Hero Preview */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Banner (Hero 21:4)</p>
              <div className="relative aspect-[21/4] rounded-lg overflow-hidden border-2 border-primary/30 bg-muted">
                {heroPreview ? (
                  <img 
                    src={heroPreview} 
                    alt="Banner do projeto" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-sm">Sem imagem de banner</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Card Preview */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Card (16:9)</p>
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/30 bg-muted max-w-[300px]">
                {cardPreview ? (
                  <img 
                    src={cardPreview} 
                    alt="Card do projeto" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-sm">Sem imagem de card</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {allowReadjust && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleReadjust}
                  disabled={isProcessing}
                >
                  <CropIcon className="w-4 h-4 mr-1" />
                  {isProcessing ? 'Carregando...' : 'Reajustar'}
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-1" />
                Trocar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleClearImages}
              >
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
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
              Você vai ajustar o recorte para Banner (3:1) e Card (16:9)
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
            <DialogTitle>Ajustar Imagens de Capa</DialogTitle>
            <DialogDescription>
              Ajuste o recorte para o Banner e depois para o Card
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tab selector */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'hero' | 'card')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hero" className="flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  1. Banner (21:4)
                  {croppedImages.hero && <Check className="w-4 h-4 text-green-500" />}
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  2. Card (16:9)
                  {croppedImages.card && <Check className="w-4 h-4 text-green-500" />}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Info */}
            <div className="text-center p-2 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {activeTab === 'hero' ? (
                  <><strong>Passo 1:</strong> Ajuste o recorte do Banner que aparece no cabeçalho da página do projeto</>
                ) : (
                  <><strong>Passo 2:</strong> Ajuste o recorte do Card que aparece na listagem de projetos</>
                )}
              </p>
            </div>

            {/* Crop Area */}
            <div 
              ref={containerRef}
              className={`flex justify-center bg-muted rounded-lg p-4 overflow-hidden ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
              onMouseDown={handlePanStart}
              onMouseMove={handlePanMove}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
            >
              {imageSrc && (
                <div className="relative crop-dashed-style">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={getCurrentAspectRatio()}
                    keepSelection={true}
                    className="max-h-[400px]"
                    disabled={isPanning}
                  >
                    <img
                      ref={imgRef}
                      alt="Imagem para recortar"
                      src={imageSrc}
                      crossOrigin="anonymous"
                      style={{ 
                        transform: `translate(${panX}px, ${panY}px) scale(${scale}) rotate(${rotate}deg)`,
                        maxHeight: '400px',
                        width: 'auto',
                        transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                        userSelect: 'none',
                        pointerEvents: scale > 1 ? 'none' : 'auto'
                      }}
                      onLoad={onImageLoad}
                      draggable={false}
                    />
                  </ReactCrop>
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
                          {activeTab === 'hero' ? 'Banner (21:4)' : 'Card (16:9)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Pan hint when zoomed */}
            {scale > 1 && (
              <p className="text-xs text-center text-muted-foreground">
                <Move className="w-3 h-3 inline mr-1" />
                Arraste para mover a imagem
              </p>
            )}

            {/* Controls */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
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

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setScale(1);
                  setRotate(0);
                  setPanX(0);
                  setPanY(0);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isProcessing}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveCrop} 
              disabled={isProcessing || !completedCrop}
            >
              <Check className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : (activeTab === 'hero' ? 'Salvar e Continuar' : 'Confirmar Tudo')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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