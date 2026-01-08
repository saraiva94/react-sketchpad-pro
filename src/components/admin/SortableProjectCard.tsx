import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface SortableProjectCardProps {
  id: string;
  children: ReactNode;
  isAdmin?: boolean;
}

export function SortableProjectCard({ id, children, isAdmin = false }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-grab active:cursor-grabbing touch-none"
      {...attributes}
      {...listeners}
      title="Segure 0.5s e arraste"
    >
      {/* Drag handle - visual hint for admins */}
      <div
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-md p-1 border shadow-sm"
        aria-hidden="true"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

// Sensor configuration with 500ms delay
export const DRAG_ACTIVATION_DELAY = 500; // milliseconds
