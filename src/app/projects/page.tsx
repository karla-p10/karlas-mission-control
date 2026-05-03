"use client";

import { useState, useMemo } from "react";
import { Plus, FolderOpen, FolderPlus, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { Button } from "@/components/ui/button";
import { useTasks, type Task, type TaskStatus, COLOR_MAP } from "@/lib/store";
import { cn } from "@/lib/utils";

const EMOJI_OPTIONS = ["📁", "🚀", "💡", "🎯", "⚡", "🛠️", "📝", "🌿", "💼", "🔥", "🎨", "📊"];
const COLOR_OPTIONS = Object.keys(COLOR_MAP) as (keyof typeof COLOR_MAP)[];

const COLUMNS: { status: TaskStatus; label: string; dotClass: string }[] = [
  { status: "inbox", label: "Inbox", dotClass: "bg-slate-400" },
  { status: "in-progress", label: "In Progress", dotClass: "bg-primary" },
  { status: "waiting", label: "Waiting", dotClass: "bg-amber-400" },
  { status: "done", label: "Done", dotClass: "bg-emerald-500" },
];

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectEmoji, setNewProjectEmoji] = useState("📁");
  const [newProjectColor, setNewProjectColor] = useState<keyof typeof COLOR_MAP>("purple");
  const { tasks, categories, addCategory } = useTasks();

  const handleCreateProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    addCategory({ name, emoji: newProjectEmoji, color: newProjectColor });
    setNewProjectName("");
    setNewProjectEmoji("📁");
    setNewProjectColor("purple");
    setNewProjectOpen(false);
  };

  // Build project stats
  const projectStats = useMemo(() => {
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.category === cat.id);
      const done = catTasks.filter((t) => t.status === "done").length;
      const total = catTasks.length;
      const progress = total === 0 ? 0 : Math.round((done / total) * 100);
      return { ...cat, taskCount: total, done, progress };
    });
  }, [categories, tasks]);

  const selectedCategory = categories.find((c) => c.id === selectedProject);

  const filteredTasks = useMemo(() => {
    if (!selectedProject) return tasks;
    return tasks.filter((t) => t.category === selectedProject);
  }, [tasks, selectedProject]);

  const grouped = useMemo(() => ({
    inbox: filteredTasks.filter((t) => t.status === "inbox"),
    "in-progress": filteredTasks.filter((t) => t.status === "in-progress"),
    waiting: filteredTasks.filter((t) => t.status === "waiting"),
    done: filteredTasks.filter((t) => t.status === "done"),
  }), [filteredTasks]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  return (
    <AppShell onAddTask={handleAdd}>
      <div className="flex h-full">
        {/* Left sidebar — project list */}
        <aside className="w-64 flex-shrink-0 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-foreground">Projects</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{categories.length} project{categories.length !== 1 ? "s" : ""}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                onClick={() => setNewProjectOpen((v) => !v)}
                title="New project"
              >
                <FolderPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Inline new project form */}
            {newProjectOpen && (
              <div className="bg-background rounded-xl border border-border p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">New Project</span>
                  <button onClick={() => setNewProjectOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Emoji picker */}
                <div className="flex flex-wrap gap-1">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setNewProjectEmoji(em)}
                      className={cn(
                        "w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all",
                        newProjectEmoji === em ? "bg-primary/15 ring-1 ring-primary" : "hover:bg-muted"
                      )}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                {/* Name input */}
                <input
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                  placeholder="Project name..."
                  className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                />
                {/* Color picker */}
                <div className="flex gap-1">
                  {COLOR_OPTIONS.map((col) => {
                    const c = COLOR_MAP[col];
                    return (
                      <button
                        key={col}
                        onClick={() => setNewProjectColor(col)}
                        className={cn(
                          "w-5 h-5 rounded-full transition-all",
                          c.dot,
                          newProjectColor === col ? "ring-2 ring-offset-1 ring-primary scale-110" : "opacity-60 hover:opacity-100"
                        )}
                      />
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="w-full h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                >
                  Create Project
                </Button>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* All Projects */}
            <button
              onClick={() => setSelectedProject(null)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                selectedProject === null
                  ? "bg-[#F0E8DC] text-[#8B7355] border-l-2 border-[#8B7355]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
              All Projects
            </button>

            {projectStats.map((proj) => {
              const colors = COLOR_MAP[proj.color] ?? COLOR_MAP.purple;
              const isActive = selectedProject === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProject(proj.id)}
                  className={cn(
                    "w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                    isActive
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{proj.emoji}</span>
                    <span className={cn("font-medium", isActive ? "text-primary" : "text-foreground")}>
                      {proj.name}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">{proj.taskCount}</span>
                  </div>
                  {proj.taskCount > 0 && (
                    <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", colors.dot.replace("bg-", "bg-"))}
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto">
          {selectedProject === null ? (
            // All Projects grid view
            <div className="p-6 max-w-5xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">All Projects</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {tasks.filter((t) => t.status !== "done").length} active tasks across {categories.length} projects
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setNewProjectOpen(true)}
                    variant="outline"
                    className="rounded-xl gap-2 border-border"
                  >
                    <FolderPlus className="w-4 h-4" />
                    New Project
                  </Button>
                  <Button
                    onClick={handleAdd}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectStats.map((proj) => {
                  const colors = COLOR_MAP[proj.color] ?? COLOR_MAP.purple;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => setSelectedProject(proj.id)}
                      className="bg-card rounded-2xl border border-border p-5 text-left hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl", colors.bg)}>
                          {proj.emoji}
                        </div>
                        <div>
                          <div className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                            {proj.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {proj.taskCount} task{proj.taskCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{proj.done} done</span>
                          <span>{proj.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", colors.dot)}
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex gap-1.5 flex-wrap">
                        {proj.taskCount === 0 ? (
                          <span className="text-xs text-muted-foreground">No tasks yet</span>
                        ) : (
                          <>
                            {tasks.filter((t) => t.category === proj.id && t.status === "in-progress").length > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {tasks.filter((t) => t.category === proj.id && t.status === "in-progress").length} in progress
                              </span>
                            )}
                            {tasks.filter((t) => t.category === proj.id && t.status === "inbox").length > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                {tasks.filter((t) => t.category === proj.id && t.status === "inbox").length} inbox
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Single project kanban view
            <div className="p-6 max-w-5xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCategory?.emoji}</span>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">{selectedCategory?.name}</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {filteredTasks.filter((t) => t.status !== "done").length} active ·{" "}
                      {filteredTasks.filter((t) => t.status === "done").length} done
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAdd}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </div>

              <div className="space-y-6">
                {COLUMNS.map(({ status, label, dotClass }) => (
                  <section key={status}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn("w-2 h-2 rounded-full", dotClass)} />
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        {label} · {grouped[status].length}
                      </h3>
                    </div>
                    {grouped[status].length === 0 ? (
                      <div className="bg-card/50 rounded-xl border border-border border-dashed p-4 text-center text-sm text-muted-foreground">
                        Nothing here yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {grouped[status].map((task) => (
                          <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditTask(null);
        }}
        task={editTask}
        defaultCategory={selectedProject ?? undefined}
      />
    </AppShell>
  );
}
