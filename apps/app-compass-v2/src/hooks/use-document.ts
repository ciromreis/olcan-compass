"use client";

import { useParams } from "next/navigation";
import { useForgeStore, DOC_TYPE_LABELS, type ForgeDocument } from "@/stores/forge";
import { wordCount, paragraphCount, readingTime } from "@/lib/format";

/**
 * Hook for Forge document pages — resolves doc from route params,
 * provides derived stats, and exposes common store actions.
 * Eliminates repeated useParams + getDocById + stat computation across 8+ pages.
 */
export function useDocument(explicitId?: string) {
  const params = useParams();
  const docId = explicitId || (params.id as string);

  const {
    getDocById,
    updateContent,
    updateTitle,
    saveVersion,
    deleteDocument,
  } = useForgeStore();

  const doc = getDocById(docId);

  const stats = doc
    ? {
        wordCount: wordCount(doc.content),
        paragraphCount: paragraphCount(doc.content),
        readingTime: readingTime(doc.content),
        charCount: doc.content.length,
        versionCount: doc.versions.length,
        typeLabel: DOC_TYPE_LABELS[doc.type],
        hasContent: doc.content.trim().length >= 30,
      }
    : null;

  return {
    docId,
    doc,
    stats,
    updateContent: (content: string) => updateContent(docId, content),
    updateTitle: (title: string) => updateTitle(docId, title),
    saveVersion: (label?: string) => saveVersion(docId, label),
    deleteDocument: () => deleteDocument(docId),
    found: !!doc,
  };
}

export type UseDocumentReturn = ReturnType<typeof useDocument>;
export type { ForgeDocument };
