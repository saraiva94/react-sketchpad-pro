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
  onImagesCropped: (
    heroBlob: Blob | null, 
    heroUrl: string | null, 
    cardBlob: Blob | null, 
    cardUrl: string | null,
    originalBlob?: Blob | null,
    originalUrl?: string | null
  ) => void;
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
  const [activeTab, setActiveTab] = useState<'hero' | 'card'>('hero');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Selection box position (as percentage of image dimensions)
  // selectionY is where the TOP of the selection box is positioned (0 = top, 100 = would be off image)
  const [selectionY, setSelectionY] = useState(0);
  // selectionWidth as percentage of image width (smaller = more zoomed in)
  const [selectionWidth, setSelectionWidth] = useState(100);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartSelY, setDragStartSelY] = useState(0);
  
  // Store cropped results for both
  const [croppedImages, setCroppedImages] = useState<CroppedImages>({ hero: null, card: null });
  const [heroPreview, setHeroPreview] = useState<string | null>(currentHeroImage || null);
  const [cardPreview, setCardPreview] = useState<string | null>(currentCardImage || null);
  
  // Store the original image for readjustments
  const [storedOriginalSrc, setStoredOriginalSrc] = useState<string | null>(null);
  
  // Image natural dimensions
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  
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

  // Calculate selection box height based on width and aspect ratio
  const getSelectionHeightPercent = useCallback(() => {
    if (imageNaturalSize.width === 0 || imageNaturalSize.height === 0) return 20;
    
    const aspectRatio = getCurrentAspectRatio();
    // selectionWidth is percentage of image width
    const actualWidth = (selectionWidth / 100) * imageNaturalSize.width;
    const actualHeight = actualWidth / aspectRatio;
    const heightPercent = (actualHeight / imageNaturalSize.height) * 100;
    return Math.min(heightPercent, 100);
  }, [selectionWidth, imageNaturalSize, getCurrentAspectRatio]);

  // Reset position when tab changes
  useEffect(() => {
    setSelectionY(0);
    setSelectionWidth(100);
  }, [activeTab]);

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setImageNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight
      });
    }
  }, []);

  // Drag handlers - move the selection box vertically
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStartY(clientY);
    setDragStartSelY(selectionY);
  }, [selectionY]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate movement as percentage of container height
    const deltaY = ((clientY - dragStartY) / containerRect.height) * 100;
    
    // Calculate max Y based on selection height
    const selectionHeight = getSelectionHeightPercent();
    const maxY = Math.max(0, 100 - selectionHeight);
    
    const newY = Math.max(0, Math.min(maxY, dragStartSelY + deltaY));
    setSelectionY(newY);
  }, [isDragging, dragStartY, dragStartSelY, getSelectionHeightPercent]);

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
        setSelectionY(0);
        setSelectionWidth(100);
        setActiveTab('hero');
        setCroppedImages({ hero: null, card: null });
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const captureViewport = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (!imgRef.current) {
      console.error('[DualImageCropper] Missing image ref');
      return null;
    }

    const image = imgRef.current;
    const aspectRatio = getCurrentAspectRatio();
    
    // Calculate output dimensions (high quality)
    const outputWidth = 1920;
    const outputHeight = Math.round(outputWidth / aspectRatio);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Get natural image dimensions
    const imgNaturalWidth = image.naturalWidth;
    const imgNaturalHeight = image.naturalHeight;
    
    // Calculate crop dimensions based on selection
    const cropWidth = (selectionWidth / 100) * imgNaturalWidth;
    const cropHeight = cropWidth / aspectRatio;
    
    // Calculate crop position
    const cropX = ((100 - selectionWidth) / 2 / 100) * imgNaturalWidth; // Center horizontally
    const cropY = (selectionY / 100) * imgNaturalHeight;

    // Draw the cropped portion
    ctx.drawImage(
      image,
      Math.max(0, cropX),
      Math.max(0, cropY),
      Math.min(cropWidth, imgNaturalWidth - cropX),
      Math.min(cropHeight, imgNaturalHeight - cropY),
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
          
          // Convert stored original image to blob for upload
          let originalBlob: Blob | null = null;
          if (storedOriginalSrc) {
            try {
              const response = await fetch(storedOriginalSrc);
              originalBlob = await response.blob();
            } catch (e) {
              console.warn('[DualImageCropper] Could not convert original to blob:', e);
            }
          }
          
          onImagesCropped(
            heroData?.blob || null,
            heroData?.url || heroPreview,
            cardData?.blob || null,
            cardData?.url || cardPreview,
            originalBlob,
            storedOriginalSrc
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
    // Priority: stored original > explicitly passed original > fallback to current images
    // originalImageUrl should ALWAYS be the full original image from image_url field
    const imageToUse = storedOriginalSrc || originalImageUrl;
    
    if (!imageToUse) {
      toast({
        variant: 'destructive',
        title: 'Imagem original não disponível',
        description: 'Faça upload de uma nova imagem para ajustar.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (imageToUse.startsWith('data:')) {
        setImageSrc(imageToUse);
        setShowCropDialog(true);
        setSelectionY(0);
        setSelectionWidth(100);
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
          setSelectionY(0);
          setSelectionWidth(100);
          setActiveTab('hero');
          setCroppedImages({ hero: null, card: null });
          setIsProcessing(false);
        };
        
        reader.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'Não foi possível carregar',
            description: 'Clique em \\"Trocar\\" e envie a imagem novamente.',
          });
          setIsProcessing(false);
        };
        
        reader.readAsDataURL(blob);
      } else {
        setImageSrc(imageToUse);
        setStoredOriginalSrc(imageToUse);
        setShowCropDialog(true);
        setSelectionY(0);
        setSelectionWidth(100);
        setActiveTab('hero');
        setCroppedImages({ hero: null, card: null });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('[DualImageCropper] Error loading:', error);
      toast({
        variant: 'destructive',
        title: 'Não foi possível reajustar',
        description: 'Clique em \\"Trocar\\" e envie a imagem novamente.',
      });
      setIsProcessing(false);
    }
  };

  const hasAnyImage = heroPreview || cardPreview;
  const selectionHeight = getSelectionHeightPercent();

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
              Arraste a caixa de seleção sobre a imagem para escolher o trecho
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
                  <><strong>Passo 1:</strong> Arraste a caixa pontilhada para selecionar o trecho do Banner</>
                ) : (
                  <><strong>Passo 2:</strong> Arraste a caixa pontilhada para selecionar o trecho do Card</>
                )}
              </p>
            </div>

            {/* Image with Selection Overlay */}
            <div 
              ref={containerRef}
              className="relative w-full bg-black rounded-lg overflow-hidden"
            >
              {/* Original Image - Full Display */}
              {imageSrc && (
                <img
                  ref={imgRef}
                  alt="Imagem original"
                  src={imageSrc}
                  className="w-full h-auto block"
                  onLoad={handleImageLoad}
                  draggable={false}
                />
              )}
              
              {/* Dark overlay for non-selected areas */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top dark area */}
                <div 
                  className="absolute left-0 right-0 top-0 bg-black/60"
                  style={{ height: `${selectionY}%` }}
                />
                {/* Bottom dark area */}
                <div 
                  className="absolute left-0 right-0 bottom-0 bg-black/60"
                  style={{ height: `${Math.max(0, 100 - selectionY - selectionHeight)}%` }}
                />
                {/* Left dark area (for zoom) */}
                <div 
                  className="absolute top-0 left-0 bg-black/60"
                  style={{ 
                    top: `${selectionY}%`,
                    height: `${selectionHeight}%`,
                    width: `${(100 - selectionWidth) / 2}%`
                  }}
                />
                {/* Right dark area (for zoom) */}
                <div 
                  className="absolute top-0 right-0 bg-black/60"
                  style={{ 
                    top: `${selectionY}%`,
                    height: `${selectionHeight}%`,
                    width: `${(100 - selectionWidth) / 2}%`
                  }}
                />
              </div>
              
              {/* Selection Box - Draggable */}
              <div 
                className="absolute border-4 border-dashed border-primary cursor-grab active:cursor-grabbing"
                style={{
                  top: `${selectionY}%`,
                  left: `${(100 - selectionWidth) / 2}%`,
                  width: `${selectionWidth}%`,
                  height: `${selectionHeight}%`,
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary" />
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Tamanho da seleção</label>
                <div className="flex items-center gap-4">
                  <ZoomIn className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[selectionWidth]}
                    onValueChange={(values) => {
                      setSelectionWidth(values[0]);
                      // Adjust Y position if needed to keep selection in bounds
                      const newHeight = getSelectionHeightPercent();
                      if (selectionY + newHeight > 100) {
                        setSelectionY(Math.max(0, 100 - newHeight));
                      }
                    }}
                    min={30}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <ZoomOut className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {selectionWidth}%
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectionY(0);
                  setSelectionWidth(100);
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
