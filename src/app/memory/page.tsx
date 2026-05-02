"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, Edit2, Save, X, RefreshCw } from "lucide-react";

interface MemoryFile {
  name: string;
  wordCount: number;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Heading
    if (line.startsWith("### ")) {
      return <p key={i} className="font-bold text-base text-foreground mt-4 mb-1">{line.slice(4)}</p>;
    }
    if (line.startsWith("## ")) {
      return <p key={i} className="font-bold text-lg text-foreground mt-5 mb-1.5">{line.slice(3)}</p>;
    }
    if (line.startsWith("# ")) {
      return <p key={i} className="font-display font-bold text-xl text-foreground mt-6 mb-2">{line.slice(2)}</p>;
    }
    // List item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={i} className="flex gap-2 text-sm text-foreground/90 my-0.5">
          <span className="text-muted-foreground flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: inlineBold(line.slice(2)) }} />
        </div>
      );
    }
    // Empty line
    if (line.trim() === "") {
      return <div key={i} className="h-2" />;
    }
    // Normal paragraph
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

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    const res = await fetch("/api/memory");
    const data = await res.json();
    setFiles(data.files ?? []);
  }, []);

  const fetchFile = useCallback(async (name: string) => {
    setLoading(true);
    setEditing(false);
    try {
      const res = await fetch(`/api/memory?file=${encodeURIComponent(name)}`);
      const data = await res.json();
      setContent(data.content ?? "");
      setEditContent(data.content ?? "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (selected) {
      fetchFile(selected);
    }
  }, [selected, fetchFile]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch(`/api/memory?file=${encodeURIComponent(selected)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      setContent(editContent);
      setEditing(false);
      await fetchFiles(); // refresh word counts
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Left panel — file list */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Memory Files
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{files.length} files</p>
            </div>
            <button
              onClick={fetchFiles}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No files found</p>
            ) : (
              files.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelected(f.name)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl transition-all border",
                    selected === f.name
                      ? "border-primary/50 bg-primary/10"
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium truncate",
                    selected === f.name ? "text-primary" : "text-foreground"
                  )}>
                    {f.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {f.wordCount.toLocaleString()} words
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right panel — content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-5xl mb-4">🧠</div>
                <p className="font-display font-semibold text-foreground">Select a file</p>
                <p className="text-muted-foreground text-sm mt-1">Choose a memory file from the left to read it.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/30">
                <div>
                  <span className="font-medium text-foreground text-sm">{selected}</span>
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
