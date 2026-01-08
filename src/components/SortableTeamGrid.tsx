import { useState, useEffect } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { TranslatedMemberCard } from "@/components/TranslatedMemberCard";
import { useDragSensors, useReorderMembers } from "@/hooks/useReorder";

interface ProjectMember {
  id: string;
  nome: string;
  funcao: string | null;
  email: string | null;
  telefone: string | null;
  photo_url: string | null;
  curriculum_url: string | null;
  social_links: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
    imdb?: string;
    whatsapp?: string;
  } | null;
  detalhes?: string | null;
}

interface SortableMemberProps {
  member: ProjectMember;
  getInitials: (name: string | null) => string;
}

function SortableMemberCard({ member, getInitials }: SortableMemberProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-grab active:cursor-grabbing touch-none"
      {...attributes}
      {...listeners}
      title="Segure 0.5s e arraste para reordenar"
    >
      {/* Drag handle visual */}
      <div
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-md p-1 border shadow-sm"
        aria-hidden="true"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <TranslatedMemberCard member={member} getInitials={getInitials} />
    </div>
  );
}

interface SortableTeamGridProps {
  members: ProjectMember[];
  getInitials: (name: string | null) => string;
  projectId: string;
  isAdmin: boolean;
  onMembersReordered?: (newMembers: ProjectMember[]) => void;
}

export function SortableTeamGrid({
  members,
  getInitials,
  projectId,
  isAdmin,
  onMembersReordered,
}: SortableTeamGridProps) {
  const [localMembers, setLocalMembers] = useState(members);
  const sensors = useDragSensors();
  const reorderMutation = useReorderMembers(projectId);

  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localMembers.findIndex((m) => m.id === active.id);
      const newIndex = localMembers.findIndex((m) => m.id === over.id);

      const newOrder = arrayMove(localMembers, oldIndex, newIndex);
      setLocalMembers(newOrder);
      onMembersReordered?.(newOrder);

      // Salvar no banco
      reorderMutation.mutate(newOrder.map((m) => m.id));
    }
  };

  // Se não for admin, renderiza apenas a grid simples
  if (!isAdmin) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <TranslatedMemberCard
            key={member.id}
            member={member}
            getInitials={getInitials}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localMembers.map((m) => m.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localMembers.map((member) => (
            <SortableMemberCard
              key={member.id}
              member={member}
              getInitials={getInitials}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
