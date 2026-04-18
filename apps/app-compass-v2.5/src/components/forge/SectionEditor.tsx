"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui";

export interface CVSection {
  id: string;
  type: "header" | "summary" | "experience" | "education" | "skills" | "languages" | "custom";
  title: string;
  content: string;
  visible: boolean;
  order: number;
}

interface SectionEditorProps {
  sections: CVSection[];
  onSectionsChange: (sections: CVSection[]) => void;
  className?: string;
}

interface SortableSectionProps {
  section: CVSection;
  onUpdate: (id: string, updates: Partial<CVSection>) => void;
  onDelete: (id: string) => void;
}

function SortableSection({ section, onUpdate, onDelete }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        card-surface p-4 border border-cream-300 rounded-lg
        ${!section.visible ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 cursor-grab active:cursor-grabbing hover:bg-cream-200 rounded transition-colors"
        >
          <GripVertical className="w-5 h-5 text-text-muted" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={section.title}
              onChange={(e) => onUpdate(section.id, { title: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded border border-cream-400 bg-white text-body-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Título da seção"
            />
            
            <button
              onClick={() => onUpdate(section.id, { visible: !section.visible })}
              className="p-1.5 rounded hover:bg-cream-200 transition-colors"
              title={section.visible ? "Ocultar seção" : "Mostrar seção"}
            >
              {section.visible ? (
                <Eye className="w-4 h-4 text-text-muted" />
              ) : (
                <EyeOff className="w-4 h-4 text-text-muted" />
              )}
            </button>

            {section.type !== "header" && (
              <button
                onClick={() => onDelete(section.id)}
                className="p-1.5 rounded hover:bg-clay-100 transition-colors"
                title="Remover seção"
              >
                <Trash2 className="w-4 h-4 text-clay-500" />
              </button>
            )}
          </div>

          <textarea
            value={section.content}
            onChange={(e) => onUpdate(section.id, { content: e.target.value })}
            className="w-full px-3 py-2 rounded border border-cream-400 bg-white text-body-sm text-text-primary leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder={`Conteúdo da seção ${section.title}...`}
            rows={section.type === "header" ? 3 : 5}
          />
        </div>
      </div>
    </div>
  );
}

export function SectionEditor({ sections, onSectionsChange, className = "" }: SectionEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      
      const reordered = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
        ...s,
        order: idx,
      }));
      
      onSectionsChange(reordered);
    }
  };

  const handleUpdateSection = (id: string, updates: Partial<CVSection>) => {
    onSectionsChange(
      sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleDeleteSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
  };

  const handleAddSection = (type: CVSection["type"]) => {
    const newSection: CVSection = {
      id: `section-${Date.now()}`,
      type,
      title: type === "custom" ? "Nova Seção" : getSectionTitle(type),
      content: "",
      visible: true,
      order: sections.length,
    };
    
    onSectionsChange([...sections, newSection]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-h4 text-text-primary">
          Seções do Currículo
        </h3>
        <p className="text-caption text-text-muted">
          Arraste para reordenar
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onUpdate={handleUpdateSection}
                onDelete={handleDeleteSection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="card-surface border border-dashed border-cream-400 p-4 rounded-lg">
        <p className="text-body-sm font-medium text-text-primary mb-3">
          Adicionar nova seção
        </p>
        <div className="flex flex-wrap gap-2">
          {(["experience", "education", "skills", "languages", "custom"] as const).map((type) => (
            <Button
              key={type}
              onClick={() => handleAddSection(type)}
              variant="secondary"
              size="sm"
            >
              <Plus className="w-3.5 h-3.5" />
              {getSectionTitle(type)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSectionTitle(type: CVSection["type"]): string {
  const titles: Record<CVSection["type"], string> = {
    header: "Cabeçalho",
    summary: "Resumo Profissional",
    experience: "Experiência",
    education: "Formação",
    skills: "Competências",
    languages: "Idiomas",
    custom: "Seção Personalizada",
  };
  return titles[type];
}
