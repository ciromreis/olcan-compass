"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { useCommunityStore } from "@/stores/community";
import { getCommunitySaveFeedback, type CommunitySaveFeedbackKind } from "@/lib/community-feedback";
import { useToast } from "@/components/ui";
import type { SaveArtifactDraft } from "@/lib/community-artifacts";

interface UseCommunityArtifactSaveOptions {
  kind: CommunitySaveFeedbackKind;
  onSaved?: () => void;
}

export function useCommunityArtifactSave({ kind, onSaved }: UseCommunityArtifactSaveOptions) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { collections, saveArtifact } = useCommunityStore();

  const saveCommunityArtifact = useCallback((draft: SaveArtifactDraft) => {
    saveArtifact({
      ...draft,
      author: user?.full_name || "Você",
      collectionId: collections[0]?.id,
    });
    toast(getCommunitySaveFeedback(kind));
    onSaved?.();
  }, [collections, kind, onSaved, saveArtifact, toast, user?.full_name]);

  return {
    saveCommunityArtifact,
    defaultCollectionId: collections[0]?.id,
    authorName: user?.full_name || "Você",
  };
}

export type UseCommunityArtifactSaveReturn = ReturnType<typeof useCommunityArtifactSave>;
