import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Upload, X, Check, RotateCcw, ZoomIn, ZoomOut, Crop as CropIcon, Move, Image } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Aspect ratios that match the actual display dimensions
const HERO_ASPECT_RATIO = 21 / 4; // 21:4 (~5.25:1) for hero banner
const CARD_ASPECT_RATIO = 16 / 9; // 16:9 for card

interface CroppedImages {
  hero: { blob: Blob; url: string } | null;
  card: { blob: Blob; url: string } | null;
}

interface DualImageCropperProps {
  onImagesCropped: (heroBlob: Blob | null, heroUrl: string | null, cardBlob: Blob | null, cardUrl: string | null) => void;
  currentHeroImage?: string | null;
  currentCardImage?: string | null;
  originalImageUrl?: string | null;
  onClear?: () => void;
  allowReadjust?: boolean;
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
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [scale, setScale] = useState(1);
  const [activeTab, setActiveTab] = useState<'hero' | 'card'>('hero');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Position state - percentage based for the image position
  const [posX, setPosX] = useState(50); // 0-100, 50 = center
  const [posY, setPosY] = useState(50); // 0-100, 50 = center
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, posX: 50, posY: 50 });
  
  // Store cropped results for both
  const [croppedImages, setCroppedImages] = useState<CroppedImages>({ hero: null, card: null });
  const [heroPreview, setHeroPreview] = useState<string | null>(currentHeroImage || null);
  const [cardPreview, setCardPreview] = useState<string | null>(currentCardImage || null);
  
  // Store the original image for readjustments
  const [storedOriginalSrc, setStoredOriginalSrc] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

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

  // Reset position when tab changes
  useEffect(() => {
    setPosX(50);
    setPosY(50);
    setScale(1);
  }, [activeTab]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY, posX, posY });
  }, [posX, posY]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !viewportRef.current) return;
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const viewport = viewportRef.current;
    const rect = viewport.getBoundingClientRect();
    
    // Calculate movement as percentage of viewport
    const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((clientY - dragStart.y) / rect.height) * 100;
    
    // Invert because moving mouse right should move image left (to show right side)
    const newPosX = Math.max(0, Math.min(100, dragStart.posX - deltaX));
    const newPosY = Math.max(0, Math.min(100, dragStart.posY - deltaY));
    
    setPosX(newPosX);
    setPosY(newPosY);
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const dataUrl = reader.result?.toString() || '';
        setImageSrc(dataUrl);
        setStoredOriginalSrc(dataUrl);
        setShowCropDialog(true);
        setScale(1);
        setPosX(50);
        setPosY(50);
        setActiveTab('hero');
        setCroppedImages({ hero: null, card: null });
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const captureViewport = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (!imgRef.current || !viewportRef.current) {
      console.error('[DualImageCropper] Missing refs');
      return null;
    }

    const image = imgRef.current;
    const viewport = viewportRef.current;
    const aspectRatio = getCurrentAspectRatio();
    
    // Calculate output dimensions (high quality)
    const outputWidth = 1920;
    const outputHeight = Math.round(outputWidth / aspectRatio);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Calculate the source rectangle based on position and scale
    const imgNaturalWidth = image.naturalWidth;
    const imgNaturalHeight = image.naturalHeight;
    
    // The viewport shows a portion of the image based on object-position
    // We need to calculate what portion of the natural image is visible
    
    // First, figure out how the image fits in the viewport (object-fit: cover behavior)
    const viewportAspect = aspectRatio;
    const imageAspect = imgNaturalWidth / imgNaturalHeight;
    
    let sourceWidth: number, sourceHeight: number;
    
    if (imageAspect > viewportAspect) {
      // Image is wider - height fits, width is cropped
      sourceHeight = imgNaturalHeight / scale;
      sourceWidth = sourceHeight * viewportAspect;
    } else {
      // Image is taller - width fits, height is cropped
      sourceWidth = imgNaturalWidth / scale;
      sourceHeight = sourceWidth / viewportAspect;
    }
    
    // Calculate source position based on posX/posY (0-100)
    const maxOffsetX = imgNaturalWidth - sourceWidth;
    const maxOffsetY = imgNaturalHeight - sourceHeight;
    
    const sourceX = (posX / 100) * maxOffsetX;
    const sourceY = (posY / 100) * maxOffsetY;

    // Draw the cropped portion
    ctx.drawImage(
      image,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      Math.min(sourceWidth, imgNaturalWidth),
      Math.min(sourceHeight, imgNaturalHeight),
      0,
      0,
      outputWidth,
      outputHeight
    );

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
        0.92
      );
    });
  };

  const handleSaveCrop = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await captureViewport();
      
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
    setCroppedImages({ hero: null, card: null });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClearImages = () => {
    setHeroPreview(null);
    setCardPreview(null);
    setCroppedImages({ hero: null, card: null });
    setStoredOriginalSrc(null);
    if (onClear) {
      onClear();
    }
  };

  const handleReadjust = async () => {
    const imageToUse = storedOriginalSrc || originalImageUrl || currentHeroImage || currentCardImage;
    if (!imageToUse) return;

    setIsProcessing(true);
    try {
      if (imageToUse.startsWith('data:')) {
        setImageSrc(imageToUse);
        setShowCropDialog(true);
        setScale(1);
        setPosX(50);
        setPosY(50);
        setActiveTab('hero');
        setCroppedImages({ hero: null, card: null });
        setIsProcessing(false);
        return;
      }
      
      if (imageToUse.startsWith('http')) {
        const response = await fetch(imageToUse, { mode: 'cors', credentials: 'omit' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setImageSrc(dataUrl);
          setStoredOriginalSrc(dataUrl);
          setShowCropDialog(true);
          setScale(1);
          setPosX(50);
          setPosY(50);
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
        setPosX(50);
        setPosY(50);
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
              Você vai ajustar o recorte para Banner e Card
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
              Arraste a imagem para posicionar a área visível
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
                  <><strong>Passo 1:</strong> Arraste a imagem para posicionar o Banner do cabeçalho</>
                ) : (
                  <><strong>Passo 2:</strong> Arraste a imagem para posicionar o Card da listagem</>
                )}
              </p>
            </div>

            {/* Fixed Viewport - User drags image behind it */}
            <div className="flex justify-center">
              <div 
                ref={viewportRef}
                className={`relative overflow-hidden rounded-lg border-4 border-dashed border-primary bg-black cursor-grab active:cursor-grabbing select-none ${
                  activeTab === 'hero' ? 'w-full aspect-[21/4]' : 'w-full max-w-lg aspect-video'
                }`}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                {imageSrc && (
                  <img
                    ref={imgRef}
                    alt="Imagem para ajustar"
                    src={imageSrc}
                    className="absolute w-full h-full pointer-events-none"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: `${posX}% ${posY}%`,
                      transform: `scale(${scale})`,
                      transformOrigin: `${posX}% ${posY}%`,
                    }}
                    draggable={false}
                  />
                )}
                {/* Instruction overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/40 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 opacity-60">
                    <Move className="w-4 h-4" />
                    Arraste para posicionar
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[scale]}
                  onValueChange={(values) => setScale(values[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.round(scale * 100)}%
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setScale(1);
                  setPosX(50);
                  setPosY(50);
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
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : (activeTab === 'hero' ? 'Salvar e Continuar' : 'Confirmar Tudo')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
