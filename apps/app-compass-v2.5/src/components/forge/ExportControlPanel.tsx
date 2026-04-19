"use client";

import { useState, useMemo } from "react";
import {
  Download,
  FileText,
  FileJson,
  FileArchive,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  Users,
  Building,
  Calendar,
  Printer,
  FileEdit,
  GitBranch,
  Zap,
} from "lucide-react";
import { useForgeStore, type ForgeDocument, DOC_TYPE_LABELS } from "@/stores/forge";
import { useApplicationStore, type UserApplication } from "@/stores/applications";
import { useDossierStore } from "@/stores/dossier";
import type { Dossier } from "@/types/dossier-system";
import { useTaskStore } from "@/stores/taskStore";
import type { TaskStatus } from "@/lib/taskTypes";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui";

interface ExportControlPanelProps {
  className?: string;
}

interface ExportBundle {
  id: string;
  title: string;
  documents: ForgeDocument[];
  application: UserApplication | null;
  generatedAt: Date;
  format: "docx" | "pdf";
}

export function ExportControlPanel({ className = "" }: ExportControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"docx" | "pdf" | "zip">("docx");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { documents, getDocsByOpportunity } = useForgeStore();
  const { applications } = useApplicationStore();
  const { tasks } = useTaskStore();

  const activeApplications = useMemo(() => {
    return applications.filter((app) => app.status !== "submitted" && app.status !== "accepted");
  }, [applications]);

  const availableDocuments = useMemo(() => {
    if (!selectedOpportunityId) {
      return documents.filter((doc) => doc.readinessLevel === "export_ready" || doc.readinessLevel === "submitted");
    }
    return getDocsByOpportunity(selectedOpportunityId);
  }, [documents, selectedOpportunityId, getDocsByOpportunity]);

  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => task.status === "PENDING" || task.status === "IN_PROGRESS");
  }, [tasks]);

  const stats = useMemo(() => {
    const readyDocs = documents.filter((d) => d.readinessLevel === "export_ready").length;
    const totalDocs = documents.length;
    const withOpps = documents.filter((d) => d.opportunityIds && d.opportunityIds.length > 0).length;
    return {
      readyDocs,
      totalDocs,
      withOpps,
      pendingTasks: pendingTasks.length,
      activeApps: activeApplications.length,
    };
  }, [documents, pendingTasks, activeApplications]);

  const handleExport = async () => {
    if (availableDocuments.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const docsToExport = availableDocuments.filter(
        (doc) => doc.readinessLevel === "export_ready" || doc.readinessLevel === "submitted"
      );
      
      if (selectedFormat === "docx") {
        await exportAsDocx(docsToExport);
      } else if (selectedFormat === "pdf") {
        await exportAsPdf(docsToExport);
      } else if (selectedFormat === "zip") {
        await exportAsZip(docsToExport);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsDocx = async (docs: ForgeDocument[]) => {
    const { downloadDocx } = await import("@/lib/docx-export");
    const content = docs.map((doc) => `# ${doc.title}\n\n${doc.content}`).join("\n\n---\n\n");
    const title = selectedOpportunityId 
      ? applications.find((a) => a.id === selectedOpportunityId)?.program + " - Dossier"
      : "Olcan Dossier";
    downloadDocx(title, content);
  };

  const exportAsPdf = (docs: ForgeDocument[]) => {
    const content = docs.map((doc) => `<h1>${doc.title}</h1><p>${doc.content}</p>`).join("<hr>");
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${selectedOpportunityId ? applications.find((a) => a.id === selectedOpportunityId)?.program : "Olcan Dossier"}</title>
            <style>
              body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; }
              h1 { color: #001338; border-bottom: 2px solid #001338; padding-bottom: 10px; }
              hr { margin: 40px 0; border: none; border-top: 1px solid #ccc; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportAsZip = async (docs: ForgeDocument[]) => {
    if (docs.length === 0) return;
    
    const files: Array<{ name: string; content: string }> = [];
    
    for (const doc of docs) {
      const cleanName = doc.title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, "").trim();
      files.push({ name: `${cleanName}.txt`, content: doc.content });
    }
    
    let zipContent = "";
    const centralDir: string[] = [];
    let offset = 0;
    const entries: Map<string, { offset: number; size: number; compressed: number }> = new Map();
    
    for (const file of files) {
      const data = file.content + "\n";
      const compressed = data.length;
      const crc = crc32(data);
      
      entries.set(file.name, { offset, size: data.length, compressed });
      
      const localHeader = `PK\x03\x04` + 
        "\x14\x00\x00\x00\x08\x00" +
        "\x00\x00\x00\x00" +
        "\x00\x00\x00\x00" +
        pad4(file.name.length) +
        "\x00\x00\x00\x00" +
        pad4(data.length) +
        pad4(data.length) +
        file.name;
      
      offset += localHeader.length + data.length;
      zipContent += localHeader + data;
    }
    
    let centralDirectory = "";
    for (const [name, entry] of entries) {
      centralDir.push(
        "PK\x01\x02" +
        "\x00\x00\x14\x00\x00\x00\x08\x00" +
        "\x00\x00\x00\x00\x00\x00\x00\x00" +
        "\x00\x00\x00\x00" +
        pad4(name.length) +
        "\x00\x00\x28\x00\x00\x00" +
        pad4(entry.offset) +
        name
      );
      centralDirectory += centralDir[centralDir.length - 1];
    }
    
    const endOfCentral = "PK\x05\x06" +
      "\x00\x00\x00\x00" +
      pad2(files.length) +
      pad2(files.length) +
      pad4(centralDirectory.length) +
      pad4(offset) +
      "\x00\x00";
    
    const blob = new Blob([zipContent + centralDirectory + endOfCentral], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const oppName = selectedOpportunityId 
      ? applications.find((app) => app.id === selectedOpportunityId)?.program || "dossier"
      : "olcan-dossier";
    a.download = `${oppName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function pad2(n: number): string {
    return String.fromCharCode(n & 0xff, (n >> 8) & 0xff);
  }

  function pad4(n: number): string {
    return String.fromCharCode(n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff);
  }

  function crc32(data: string): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#001338] px-4 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl",
          className
        )}
      >
        <Package className="h-5 w-5" />
        <span className="font-semibold">Dossier</span>
        {stats.readyDocs > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold">
            {stats.readyDocs}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div className="fixed inset-0 bg-black/30" onClick={() => setIsOpen(false)} />
          
          <div className="relative flex h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between border-b border-cream-200 p-4">
              <div>
                <h2 className="font-heading text-h3 text-[#001338]">Painel de Exportação</h2>
                <p className="mt-1 text-caption text-[#001338]/50">
                  Exporte todo o seu dossier técnica
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 hover:bg-cream-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                <GlassCard variant="olcan" padding="md" className="border-[#001338]/5">
                  <Zap className="mb-2 h-5 w-5 text-amber-500" />
                  <p className="font-heading text-h3 text-[#001338]">{stats.pendingTasks}</p>
                  <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/40">Tarefas Pendentes</p>
                </GlassCard>
                <GlassCard variant="olcan" padding="md" className="border-[#001338]/5">
                  <Users className="mb-2 h-5 w-5 text-brand-500" />
                  <p className="font-heading text-h3 text-[#001338]">{stats.activeApps}</p>
                  <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/40">Processos Ativos</p>
                </GlassCard>
                <GlassCard variant="olcan" padding="md" className="border-[#001338]/5">
                  <FileText className="mb-2 h-5 w-5 text-[#001338]" />
                  <p className="font-heading text-h3 text-[#001338]">{stats.totalDocs}</p>
                  <p className="text-caption font-bold uppercase tracking-widest text-[#001338]/40">Documentos</p>
                </GlassCard>
                <GlassCard variant="olcan" padding="md" className="border-[#001338]/5 bg-emerald-50/50">
                  <CheckCircle className="mb-2 h-5 w-5 text-emerald-500" />
                  <p className="font-heading text-h3 text-emerald-700">{stats.readyDocs}</p>
                  <p className="text-caption font-bold uppercase tracking-widest text-emerald-600/50">Prontos</p>
                </GlassCard>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#001338]/50">
                    Selecione o Processo
                  </label>
                  <div className="grid gap-2">
                    <button
                      onClick={() => setSelectedOpportunityId(null)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        !selectedOpportunityId
                          ? "border-brand-500 bg-brand-50"
                          : "border-cream-200 hover:border-brand-300"
                      )}
                    >
                      <Package className="h-5 w-5 text-brand-500" />
                      <div className="flex-1">
                        <p className="font-semibold text-[#001338]">Todos os Documentos</p>
                        <p className="text-caption text-[#001338]/50">{stats.readyDocs} documentos prêts</p>
                      </div>
                    </button>
                    {activeApplications.map((app) => {
                      const docs = getDocsByOpportunity(app.id || app.opportunityId || '');
                      const ready = docs.filter((d) => d.readinessLevel === "export_ready").length;
                      return (
                        <button
                          key={app.id}
                          onClick={() => setSelectedOpportunityId(app.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                            selectedOpportunityId === app.id
                              ? "border-brand-500 bg-brand-50"
                              : "border-cream-200 hover:border-brand-300"
                          )}
                        >
                          <Building className="h-5 w-5 text-[#001338]" />
                          <div className="flex-1">
                            <p className="font-semibold text-[#001338]">{app.program}</p>
                            <p className="text-caption text-[#001338]/50">{app.country}</p>
                          </div>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            ready > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          )}>
                            {ready}/{docs.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#001338]/50">
                    Formato de Exportação
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "docx", label: "Word", icon: FileEdit, desc: "Editável" },
                      { id: "pdf", label: "PDF", icon: FileText, desc: "Impressão" },
                      { id: "zip", label: "ZIP", icon: FileArchive, desc: "Compactado" },
                    ].map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id as "docx" | "pdf" | "zip")}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors",
                          selectedFormat === format.id
                            ? "border-brand-500 bg-brand-50"
                            : "border-cream-200 hover:border-brand-300"
                        )}
                      >
                        <format.icon className="h-5 w-5 text-[#001338]" />
                        <span className="text-sm font-semibold text-[#001338]">{format.label}</span>
                        <span className="text-caption text-[#001338]/40">{format.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {availableDocuments.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#001338]/50">
                      Documentos a Exportar ({availableDocuments.length})
                    </label>
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {availableDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 rounded-lg border border-cream-100 bg-cream-50/50 p-2"
                        >
                          {doc.readinessLevel === "export_ready" || doc.readinessLevel === "submitted" ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                          <span className="flex-1 truncate text-sm text-[#001338]">{doc.title}</span>
                          <span className="text-caption text-[#001338]/40">
                            {DOC_TYPE_LABELS[doc.type]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-cream-200 p-4">
              <button
                onClick={handleExport}
                disabled={isExporting || availableDocuments.filter((d) => d.readinessLevel === "export_ready" || d.readinessLevel === "submitted").length === 0}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-colors",
                  availableDocuments.filter((d) => d.readinessLevel === "export_ready" || d.readinessLevel === "submitted").length > 0
                    ? "bg-[#001338] text-white hover:bg-[#001338]/90"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                {isExporting ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Exportar Dossier Técnico
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-caption text-[#001338]/40">
                Inclui Olcan branding automaticamente
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}