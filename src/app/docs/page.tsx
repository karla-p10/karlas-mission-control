"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Edit2, Save, X, RefreshCw } from "lucide-react";

interface DocMeta {
  file: string;
  emoji: string;
  label: string;
  group: "Core" | "Content";
  exists: boolean;
  wordCount: number;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("### ")) {
      return <p key={i} className="font-bold text-base text-foreground mt-4 mb-1">{line.slice(4)}</p>;
    }
    if (line.startsWith("## ")) {
      return <p key={i} className="font-bold text-lg text-foreground mt-5 mb-1.5">{line.slice(3)}</p>;
    }
    if (line.startsWith("# ")) {
      return <p key={i} className="font-display font-bold text-xl text-foreground mt-6 mb-2">{line.slice(2)}</p>;
    }
    if (line.startsWith("---")) {
      return <hr key={i} className="border-border my-3" />;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={i} className="flex gap-2 text-sm text-foreground/90 my-0.5">
          <span className="text-muted-foreground flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: inlineBold(line.slice(2)) }} />
        </div>
      );
    }
    if (line.trim() === "") {
      return <div key={i} className="h-2" />;
    }
    return (
      <p key={i} className="text-sm text-foreground/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineBold(line) }}
      />
    );
  });
}

function inlineBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selected, setSelected] = useState<DocMeta | null>(null);
  const [content, setContent] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDocs = useCallback(async () => {
    const res = await fetch("/api/docs");
    const data = await res.json();
    setDocs(data.docs ?? []);
  }, []);

  const fetchDoc = useCallback(async (file: string) => {
    setLoading(true);
    setEditing(false);
    try {
      const res = await fetch(`/api/docs?file=${encodeURIComponent(file)}`);
      const data = await res.json();
      setContent(data.content ?? "");
      setEditContent(data.content ?? "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    if (selected) {
      fetchDoc(selected.file);
    }
  }, [selected, fetchDoc]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch(`/api/docs?file=${encodeURIComponent(selected.file)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      setContent(editContent);
      setEditing(false);
      await fetchDocs();
    } finally {
      setSaving(false);
    }
  };

  const coreItems = docs.filter((d) => d.group === "Core");
  const contentItems = docs.filter((d) => d.group === "Content");

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Left panel */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Docs
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Curated workspace files</p>
            </div>
            <button
              onClick={fetchDocs}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Core section */}
            <div>
              <div className="px-2 mb-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Core</span>
              </div>
              <div className="space-y-1">
                {coreItems.map((doc) => (
                  <button
                    key={doc.file}
                    onClick={() => setSelected(doc)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl transition-all border",
                      selected?.file === doc.file
                        ? "border-primary/50 bg-primary/10"
                        : "border-transparent hover:bg-muted/50",
                      !doc.exists && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base flex-shrink-0">{doc.emoji}</span>
                      <div className="min-w-0">
                        <div className={cn(
                          "text-sm font-medium truncate",
                          selected?.file === doc.file ? "text-primary" : "text-foreground"
                        )}>
                          {doc.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {doc.exists ? `${doc.wordCount.toLocaleString()} words` : "Not found"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content section */}
            <div>
              <div className="px-2 mb-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Content</span>
              </div>
              <div className="space-y-1">
                {contentItems.map((doc) => (
                  <button
                    key={doc.file}
                    onClick={() => setSelected(doc)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl transition-all border",
                      selected?.file === doc.file
                        ? "border-primary/50 bg-primary/10"
                        : "border-transparent hover:bg-muted/50",
                      !doc.exists && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base flex-shrink-0">{doc.emoji}</span>
                      <div className="min-w-0">
                        <div className={cn(
                          "text-sm font-medium truncate",
                          selected?.file === doc.file ? "text-primary" : "text-foreground"
                        )}>
                          {doc.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {doc.exists ? `${doc.wordCount.toLocaleString()} words` : "Not found"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-5xl mb-4">📄</div>
                <p className="font-display font-semibold text-foreground">Select a document</p>
                <p className="text-muted-foreground text-sm mt-1">Choose a doc from the left to read or edit it.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/30">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selected.emoji}</span>
                  <div>
                    <span className="font-medium text-foreground text-sm">{selected.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{selected.file}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl gap-1.5"
                        onClick={() => { setEditing(false); setEditContent(content); }}
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-white"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? "Saving…" : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1.5"
                      onClick={() => setEditing(true)}
                      disabled={!selected.exists}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                {loading ? (
                  <div className="text-muted-foreground text-sm">Loading…</div>
                ) : !selected.exists ? (
                  <div className="text-muted-foreground text-sm text-center py-12">
                    <div className="text-3xl mb-3">📭</div>
                    <p>This file doesn&apos;t exist yet.</p>
                  </div>
                ) : editing ? (
                  <textarea
                    className="w-full h-full min-h-[500px] bg-muted/30 border border-border rounded-xl p-4 text-sm text-foreground font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                ) : (
                  <div className="max-w-3xl space-y-0.5">
                    {renderMarkdown(content)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
