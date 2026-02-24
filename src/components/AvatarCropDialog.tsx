import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  centerCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
}

/** Inicializa o crop em 16:9, centralizado, cobrindo 90% da largura. */
function initCrop(width: number, height: number): Crop {
  return centerCrop(
    { unit: "%", width: 90, height: 51 },
    width,
    height
  );
}

/**
 * Gera o Blob da área recortada.
 * O output mantém o aspect ratio do crop, escalado para no máximo 800px
 * no lado mais longo, em JPEG qualidade 0.9.
 */
async function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const naturalW = crop.width * scaleX;
  const naturalH = crop.height * scaleY;

  // Escala proporcional para máx 800px no lado maior
  const MAX = 800;
  const scale = Math.min(1, MAX / Math.max(naturalW, naturalH));
  const outW = Math.round(naturalW * scale);
  const outH = Math.round(naturalH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sem contexto de canvas");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    naturalW,
    naturalH,
    0,
    0,
    outW,
    outH
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Falha ao converter canvas para blob"));
      },
      "image/jpeg",
      0.9
    );
  });
}

export function AvatarCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: AvatarCropDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [processing, setProcessing] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(initCrop(width, height));
  }, []);

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop);
      onCropComplete(blob);
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao recortar imagem:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Ajustar dimensões da imagem</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 w-full">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            className="w-full"
          >
            {/* crossOrigin permite reeditar imagens já salvas no storage */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Imagem para recorte"
              crossOrigin="anonymous"
              className="w-full max-h-[33vh] object-contain"
              onLoad={onImageLoad}
            />
          </ReactCrop>

          <p className="text-xs text-muted-foreground text-center">
            Arraste para ajustar a posição e tamanho da área selecionada
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={processing || !completedCrop}
          >
            {processing ? "Processando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
