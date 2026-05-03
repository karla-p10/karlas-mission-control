"use client";

import { useState, useMemo } from "react";
import { Plus, Filter, CheckCircle2, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasks, type Task, type TaskStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const STATUSES: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "inbox", label: "Inbox" },
  { value: "in-progress", label: "In Progress" },
  { value: "waiting", label: "Waiting" },
  { value: "done", label: "Done" },
];

const COLUMNS: { status: TaskStatus; label: string; dotClass: string }[] = [
  { status: "inbox", label: "Inbox", dotClass: "bg-slate-400" },
  { status: "in-progress", label: "In Progress", dotClass: "bg-primary" },
  { status: "waiting", label: "Waiting", dotClass: "bg-amber-400" },
  { status: "done", label: "Done", dotClass: "bg-emerald-500" },
];

export default function TasksPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { tasks, categories } = useTasks();

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, categoryFilter, statusFilter, search]);

  // Group by status for kanban-like view
  const grouped = useMemo(() => ({
    inbox: filtered.filter((t) => t.status === "inbox"),
    "in-progress": filtered.filter((t) => t.status === "in-progress"),
    waiting: filtered.filter((t) => t.status === "waiting"),
    done: filtered.filter((t) => t.status === "done"),
  }), [filtered]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <AppShell onAddTask={handleAdd}>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {activeTasks} active · {tasks.filter((t) => t.status === "done").length} done
            </p>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 rounded-xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary text-sm"
            />
          </div>

          {/* Category filter */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Filter className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Category</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  categoryFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    categoryFilter === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Status</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    statusFilter === s.value
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task list */}
        {statusFilter !== "all" ? (
          filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-display font-semibold text-foreground">No tasks found</p>
              <p className="text-muted-foreground text-sm mt-1">
                Try adjusting your filters or{" "}
                <button onClick={handleAdd} className="text-primary hover:underline">add a new task</button>.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </div>
          )
        ) : (
          // Grouped kanban view — always show all 4 columns
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
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditTask(null);
        }}
        task={editTask}
      />
    </AppShell>
  );
}
