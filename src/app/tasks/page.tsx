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
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
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
    todo: filtered.filter((t) => t.status === "todo"),
    "in-progress": filtered.filter((t) => t.status === "in-progress"),
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
            className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2 shadow-lg shadow-primary/20"
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
              {/* "All" pill */}
              <button
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  categoryFilter === "all"
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
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
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
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
            <div className="flex gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    statusFilter === s.value
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
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
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-display font-semibold text-foreground">No tasks found</p>
            <p className="text-muted-foreground text-sm mt-1">
              Try adjusting your filters or{" "}
              <button onClick={handleAdd} className="text-primary hover:underline">add a new task</button>.
            </p>
          </div>
        ) : statusFilter !== "all" ? (
          // Flat list when filtering by status
          <div className="space-y-2">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} />
            ))}
          </div>
        ) : (
          // Grouped view
          <div className="space-y-6">
            {grouped.todo.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    To Do · {grouped.todo.length}
                  </h3>
                </div>
                <div className="space-y-2">
                  {grouped.todo.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                  ))}
                </div>
              </section>
            )}

            {grouped["in-progress"].length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    In Progress · {grouped["in-progress"].length}
                  </h3>
                </div>
                <div className="space-y-2">
                  {grouped["in-progress"].map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                  ))}
                </div>
              </section>
            )}

            {grouped.done.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Done · {grouped.done.length}
                  </h3>
                </div>
                <div className="space-y-2">
                  {grouped.done.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                  ))}
                </div>
              </section>
            )}
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
