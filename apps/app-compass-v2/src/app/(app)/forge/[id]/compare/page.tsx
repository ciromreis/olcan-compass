"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useForgeStore } from "@/stores/forge";

function computeDiff(oldText: string, newText: string): { type: "context" | "added" | "removed"; text: string }[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: { type: "context" | "added" | "removed"; text: string }[] = [];

  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  // Simple line-level diff
  let oi = 0;
  let ni = 0;
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      result.push({ type: "context", text: oldLines[oi] });
      oi++;
      ni++;
    } else if (oi < oldLines.length && !newSet.has(oldLines[oi])) {
      result.push({ type: "removed", text: oldLines[oi] });
      oi++;
    } else if (ni < newLines.length && !oldSet.has(newLines[ni])) {
      result.push({ type: "added", text: newLines[ni] });
      ni++;
    } else {
      // Mismatch — show as remove + add
      if (oi < oldLines.length) { result.push({ type: "removed", text: oldLines[oi] }); oi++; }
      if (ni < newLines.length) { result.push({ type: "added", text: newLines[ni] }); ni++; }
    }
  }
  return result;
}

export default function ComparePage() {
  const params = useParams();
  const docId = params.id as string;
  const { getDocById } = useForgeStore();
  const doc = getDocById(docId);

  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(doc && doc.versions.length > 1 ? 1 : 0);

  const versions = doc?.versions || [];
  const leftVersion = versions[leftIdx];
  const rightVersion = versions[rightIdx];

  const diff = useMemo(
    () => computeDiff(leftVersion?.content || "", rightVersion?.content || ""),
    [leftVersion, rightVersion]
  );

  const addedCount = diff.filter((d) => d.type === "added").length;
  const removedCount = diff.filter((d) => d.type === "removed").length;
  const wordDelta = (rightVersion?.wordCount || 0) - (leftVersion?.wordCount || 0);

  if (!doc || doc.versions.length < 2) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-body text-text-muted mb-4">
          {!doc ? "Documento não encontrado." : "Precisa de pelo menos 2 versões salvas para comparar."}
        </p>
        <Link href={doc ? `/forge/${docId}` : "/forge"} className="text-brand-500 font-medium hover:underline">← Voltar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/forge/${docId}`} className="p-2 rounded-lg hover:bg-cream-200 transition-colors"><ArrowLeft className="w-5 h-5 text-text-muted" /></Link>
        <div>
          <h1 className="font-heading text-h2 text-text-primary">Comparar Versões</h1>
          <p className="text-body-sm text-text-secondary">{doc.title}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={leftIdx}
          onChange={(e) => setLeftIdx(Number(e.target.value))}
          className="flex-1 px-4 py-2 rounded-lg border border-cream-500 bg-white text-text-primary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {versions.map((v, i) => (
            <option key={v.id} value={i}>
              {v.label || `Versão ${i + 1}`} — {new Date(v.savedAt).toLocaleDateString("pt-BR")} ({v.wordCount} palavras)
            </option>
          ))}
        </select>
        <span className="flex items-center text-text-muted">→</span>
        <select
          value={rightIdx}
          onChange={(e) => setRightIdx(Number(e.target.value))}
          className="flex-1 px-4 py-2 rounded-lg border border-cream-500 bg-white text-text-primary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {versions.map((v, i) => (
            <option key={v.id} value={i}>
              {v.label || `Versão ${i + 1}`} — {new Date(v.savedAt).toLocaleDateString("pt-BR")} ({v.wordCount} palavras)
            </option>
          ))}
        </select>
      </div>

      <div className="card-surface p-6 font-mono text-body-sm leading-relaxed max-h-[500px] overflow-y-auto">
        {diff.map((line, i) => (
          <div key={i} className={`px-3 py-1 rounded ${line.type === "added" ? "bg-brand-50 text-brand-700" : line.type === "removed" ? "bg-clay-50 text-clay-600 line-through" : "text-text-secondary"}`}>
            {line.type === "added" && <Plus className="w-3 h-3 inline mr-1" />}
            {line.type === "removed" && <Minus className="w-3 h-3 inline mr-1" />}
            {line.text || "\u00A0"}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted">Linhas adicionadas</p>
          <p className="font-heading text-h3 text-brand-500">+{addedCount}</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted">Linhas removidas</p>
          <p className="font-heading text-h3 text-clay-500">-{removedCount}</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-caption text-text-muted">Delta de palavras</p>
          <p className={`font-heading text-h3 ${wordDelta >= 0 ? "text-brand-500" : "text-clay-500"}`}>
            {wordDelta >= 0 ? "+" : ""}{wordDelta}
          </p>
        </div>
      </div>
    </div>
  );
}
