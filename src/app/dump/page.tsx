"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks, type TaskPriority } from "@/lib/store";
import { Brain, Sparkles, RotateCcw, CheckCircle2, Plus, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Parser ───────────────────────────────────────────────────────────────────

function guessCategory(text: string, categories: { id: string; name: string }[]): string {
  const t = text.toLowerCase();
  // Keyword → category id map (matches default categories)
  const rules: [RegExp, string][] = [
    [/grocery|supermarket|store|shop|buy|pick up|errand|pharmacy|supplies/, "errands"],
    [/doctor|dentist|appointment|clinic|hospital|health|medicine|therapy|workout|gym|yoga|exercise|run|walk/, "health"],
    [/school|homework|kids?|child|son|daughter|emma|jake|pickup|drop.?off|tutor|soccer|practice|game/, "kids"],
    [/meeting|email|report|project|work|boss|client|deadline|presentation|slack|zoom|call|standup/, "work"],
    [/clean|fix|repair|garage|house|home|laundry|dishes|vacuum|mow|lawn|paint|plumb|electric|utility|bills?/, "home"],
    [/friend|lunch|dinner|party|catch.?up|social|personal|self|read|book|journal|relax|date/, "personal"],
  ];
  for (const [regex, id] of rules) {
    if (regex.test(t)) {
      // Make sure the category actually exists in the store
      if (categories.find((c) => c.id === id)) return id;
    }
  }
  // Fallback to first category or personal
  return categories.find((c) => c.id === "personal")?.id ?? categories[0]?.id ?? "personal";
}

function guessPriority(text: string): TaskPriority {
  const t = text.toLowerCase();
  if (/urgent|asap|important|critical|immediately|today|now|!!/.test(t)) return "high";
  if (/maybe|sometime|eventually|whenever|someday|low priority|not urgent/.test(t)) return "low";
  return "medium";
}

function parseText(
  raw: string,
  categories: { id: string; name: string }[]
): ParsedTask[] {
  const lines = raw
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  return lines.map((line, i) => ({
    id: `dump-${i}-${Date.now()}`,
    title: line
      // Remove leading bullets / dashes / numbers
      .replace(/^[\s\-•*\d.]+/, "")
      .trim(),
    category: guessCategory(line, categories),
    priority: guessPriority(line),
    skip: false,
  }));
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedTask {
  id: string;
  title: string;
  category: string;
  priority: TaskPriority;
  skip: boolean;
}

type PageState = "input" | "loading" | "review" | "done";

const PRIORITY_LABELS: Record<TaskPriority, { label: string; className: string }> = {
  high:   { label: "High",   className: "bg-red-100 text-red-700" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700" },
  low:    { label: "Low",    className: "bg-slate-100 text-slate-600" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative">
        {/* Pulsing brain */}
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
          <Brain className="w-10 h-10 text-accent" />
        </div>
        {/* Orbiting sparkles */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
          <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-accent/60" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }}>
          <Sparkles className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 text-primary/60" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-foreground text-lg">🤖 Rosie is thinking...</p>
        <p className="text-muted-foreground text-sm mt-1">Sorting through your thoughts</p>
        <div className="flex items-center justify-center gap-1 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ParsedTaskCardProps {
  task: ParsedTask;
  categories: { id: string; name: string; emoji: string }[];
  onChange: (id: string, updates: Partial<ParsedTask>) => void;
}

function ParsedTaskCard({ task, categories, onChange }: ParsedTaskCardProps) {
  const [editingTitle, setEditingTitle] = useState(false);

  if (task.skip) return null;

  const cat = categories.find((c) => c.id === task.category);
  const priorityStyle = PRIORITY_LABELS[task.priority];

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3 hover:border-primary/30 transition-colors">
      {/* Title */}
      <div className="flex items-start gap-2">
        {editingTitle ? (
          <Input
            value={task.title}
            autoFocus
            className="rounded-xl flex-1 text-sm font-medium"
            onChange={(e) => onChange(task.id, { title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingTitle(false); }}
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
            onClick={() => setEditingTitle(true)}
            title="Click to edit"
          >
            {task.title || <span className="text-muted-foreground italic">Click to edit...</span>}
          </button>
        )}
      </div>

      {/* Dropdowns row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Category */}
        <Select
          value={task.category}
          onValueChange={(v) => v && onChange(task.id, { category: v })}
        >
          <SelectTrigger className="h-7 rounded-lg text-xs px-2 w-auto gap-1 border-border bg-muted/50">
            <SelectValue>
              {cat ? `${cat.emoji} ${cat.name}` : "Category"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs">
                {c.emoji} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select
          value={task.priority}
          onValueChange={(v) => onChange(task.id, { priority: v as TaskPriority })}
        >
          <SelectTrigger className={cn(
            "h-7 rounded-lg text-xs px-2 w-auto gap-1 border-0",
            priorityStyle.className
          )}>
            <SelectValue>
              {priorityStyle.label} priority
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="high" className="text-xs">🔴 High priority</SelectItem>
            <SelectItem value="medium" className="text-xs">🟡 Medium priority</SelectItem>
            <SelectItem value="low" className="text-xs">🟢 Low priority</SelectItem>
          </SelectContent>
        </Select>

        {/* Skip */}
        <button
          onClick={() => onChange(task.id, { skip: true })}
          className="ml-auto h-7 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 rounded-lg hover:bg-destructive/10"
        >
          <X className="w-3 h-3" /> Skip
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrainDumpPage() {
  const { categories, addTask } = useTasks();
  const [pageState, setPageState] = useState<PageState>("input");
  const [rawText, setRawText] = useState("");
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [addedCount, setAddedCount] = useState(0);

  const handleProcess = () => {
    if (!rawText.trim()) return;
    setPageState("loading");
    setTimeout(() => {
      const tasks = parseText(rawText, categories);
      setParsedTasks(tasks);
      setPageState("review");
    }, 2000);
  };

  const handleChangeTask = (id: string, updates: Partial<ParsedTask>) => {
    setParsedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleAddOne = (task: ParsedTask) => {
    if (!task.title.trim()) return;
    addTask({
      title: task.title,
      category: task.category,
      priority: task.priority,
      status: "todo",
    });
    handleChangeTask(task.id, { skip: true });
  };

  const visibleTasks = parsedTasks.filter((t) => !t.skip);

  const handleAddAll = () => {
    let count = 0;
    visibleTasks.forEach((task) => {
      if (task.title.trim()) {
        addTask({
          title: task.title,
          category: task.category,
          priority: task.priority,
          status: "todo",
        });
        count++;
      }
    });
    setAddedCount(count);
    setPageState("done");
  };

  const handleStartOver = () => {
    setRawText("");
    setParsedTasks([]);
    setPageState("input");
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 mb-2">
            <Brain className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Brain Dump
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Your head is full. That's okay. Just get it all out — Rosie will turn the chaos into a clean task list. ✨
          </p>
        </div>

        {/* ── INPUT STATE ── */}
        {pageState === "input" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <textarea
                className="w-full p-5 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none bg-transparent min-h-[260px] leading-relaxed"
                placeholder="What's on your mind? Just dump it all here — grocery list, appointments, that thing you keep forgetting...

• Pick up Emma from school
• Dentist appointment for Jake (urgent!)
• Send quarterly report to Sarah
• Grocery run — need milk, eggs, bread
• Clean out the garage sometime
• Schedule yoga class"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Separate items by line, comma, or semicolon
                </span>
                <span className="text-xs text-muted-foreground">
                  {rawText.split(/[\n,;]+/).filter((l) => l.trim().length > 2).length} items detected
                </span>
              </div>
            </div>

            <Button
              onClick={handleProcess}
              disabled={!rawText.trim()}
              className="w-full rounded-xl bg-accent hover:bg-accent/90 text-white gap-2 h-12 text-base shadow-lg shadow-accent/20 font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Let Rosie Organize This ✨
            </Button>

            {/* Encouragement */}
            <div className="bg-gradient-to-br from-primary/8 to-accent/8 rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground leading-relaxed text-center">
                💡 <strong>Tip:</strong> Don't overthink it. Just write whatever's in your head — messy, incomplete, whatever.
                Rosie will sort it out. That's literally her job.
              </p>
            </div>
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {pageState === "loading" && <LoadingAnimation />}

        {/* ── REVIEW STATE ── */}
        {pageState === "review" && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-card rounded-2xl border border-border px-4 py-3">
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {visibleTasks.length} task{visibleTasks.length !== 1 ? "s" : ""} found
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review, edit, then add what you want.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartOver}
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <RotateCcw className="w-3 h-3" /> Start Over
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddAll}
                  disabled={visibleTasks.length === 0}
                  className="rounded-xl gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="w-3.5 h-3.5" /> Add All ({visibleTasks.length})
                </Button>
              </div>
            </div>

            {/* Task cards */}
            {visibleTasks.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <div className="text-3xl mb-3">👍</div>
                <p className="font-semibold text-foreground">All done!</p>
                <p className="text-muted-foreground text-sm mt-1">You skipped everything. Try starting over.</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl gap-2"
                  onClick={handleStartOver}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Start Over
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {parsedTasks.map((task) =>
                  task.skip ? null : (
                    <div key={task.id} className="relative group">
                      <ParsedTaskCard
                        task={task}
                        categories={categories}
                        onChange={handleChangeTask}
                      />
                      {/* Individual Add button */}
                      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          className="h-7 rounded-lg text-xs bg-primary hover:bg-primary/90 text-white gap-1"
                          onClick={() => handleAddOne(task)}
                        >
                          <Plus className="w-3 h-3" /> Add
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* ── DONE STATE ── */}
        {pageState === "done" && (
          <div className="text-center py-12 space-y-5">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="absolute -top-1 -right-1 text-2xl animate-bounce">🎉</div>
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-foreground">
                {addedCount} task{addedCount !== 1 ? "s" : ""} added!
              </p>
              <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                Your brain is officially lighter. Rosie's got the list.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl gap-2"
                onClick={handleStartOver}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Dump more
              </Button>
              <Button
                className="rounded-xl gap-2 bg-primary hover:bg-primary/90 text-white"
                onClick={() => window.location.href = "/tasks"}
              >
                View tasks <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
