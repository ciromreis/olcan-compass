"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Highlighter,
  Type,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  maxCharacters?: number;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  onSave,
  placeholder = "Comece a escrever...",
  maxCharacters,
  className = "",
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxCharacters,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-500 underline hover:text-brand-600",
        },
      }),
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 py-4",
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, onSave]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  return (
    <div className={cn("border border-cream-300 rounded-lg bg-white", className)}>
      {/* Toolbar */}
      <div className="border-b border-cream-300 p-2 flex flex-wrap items-center gap-1">
        {/* Text formatting */}
        <div className="flex items-center gap-0.5 border-r border-cream-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors disabled:opacity-30",
              editor.isActive("bold") && "bg-brand-100 text-brand-600"
            )}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors disabled:opacity-30",
              editor.isActive("italic") && "bg-brand-100 text-brand-600"
            )}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors disabled:opacity-30",
              editor.isActive("strike") && "bg-brand-100 text-brand-600"
            )}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("highlight") && "bg-amber-100 text-amber-600"
            )}
            title="Destacar"
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r border-cream-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("heading", { level: 1 }) && "bg-brand-100 text-brand-600"
            )}
            title="Título 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("heading", { level: 2 }) && "bg-brand-100 text-brand-600"
            )}
            title="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("heading", { level: 3 }) && "bg-brand-100 text-brand-600"
            )}
            title="Título 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("paragraph") && "bg-brand-100 text-brand-600"
            )}
            title="Parágrafo"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r border-cream-300 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("bulletList") && "bg-brand-100 text-brand-600"
            )}
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("orderedList") && "bg-brand-100 text-brand-600"
            )}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("blockquote") && "bg-brand-100 text-brand-600"
            )}
            title="Citação"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Link */}
        <div className="flex items-center gap-0.5 border-r border-cream-300 pr-2 mr-2">
          <button
            onClick={setLink}
            className={cn(
              "p-2 rounded hover:bg-cream-200 transition-colors",
              editor.isActive("link") && "bg-brand-100 text-brand-600"
            )}
            title="Adicionar link"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded hover:bg-cream-200 transition-colors disabled:opacity-30"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded hover:bg-cream-200 transition-colors disabled:opacity-30"
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-4 text-caption text-text-muted">
          <span>{wordCount} palavras</span>
          {maxCharacters && (
            <span className={characterCount > maxCharacters ? "text-clay-500" : ""}>
              {characterCount} / {maxCharacters} caracteres
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
