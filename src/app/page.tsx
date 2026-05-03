"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Plus, ArrowRight, Rocket, CheckCircle2, Clock, Circle, FolderOpen, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DashboardCard } from "@/components/DashboardCard";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { Button } from "@/components/ui/button";
import { useTasks, type Task } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const { tasks } = useTasks();
  const { user, profile } = useAuth();

  const firstName =
    profile?.display_name?.split(" ")[0] ||
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "there";

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === todayStr),
    [tasks, todayStr]
  );

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    inbox: tasks.filter((t) => t.status === "inbox").length,
  }), [tasks]);

  // Projects derived from task categories
  const projects = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    tasks.forEach((t) => {
      const cat = t.category || "Uncategorized";
      if (!map.has(cat)) map.set(cat, { total: 0, done: 0 });
      const entry = map.get(cat)!;
      entry.total++;
      if (t.status === "done") entry.done++;
    });
    return Array.from(map.entries()).slice(0, 4);
  }, [tasks]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleAddTask = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell onAddTask={handleAddTask}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Welcome header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {format(today, "EEEE, MMMM d")}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {stats.done} of {stats.total} tasks done. {stats.inProgress > 0 ? `${stats.inProgress} in progress.` : "Ready to move something forward?"}
            </p>
          </div>
          <Button
            onClick={handleAddTask}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 hidden sm:flex shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Inbox", count: stats.inbox, icon: Circle, color: "text-slate-500", bg: "bg-slate-50" },
            { label: "In Progress", count: stats.inProgress, icon: Clock, color: "text-primary", bg: "bg-primary/8" },
            { label: "Done", count: stats.done, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <div key={label} className={cn("rounded-2xl p-4 border border-border", bg)}>
              <div className={cn("flex items-center gap-1.5 text-xs font-medium mb-2", color)}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{count}</div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's tasks */}
          <div className="lg:col-span-2">
            <DashboardCard
              title="Today's Tasks"
              action={
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs rounded-xl gap-1">
                    All tasks <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3">🎉</div>
                  <p className="font-medium text-foreground text-sm">Nothing due today!</p>
                  <p className="text-muted-foreground text-xs mt-1">Enjoy the peace, or add something new.</p>
                  <Button
                    onClick={handleAddTask}
                    size="sm"
                    className="mt-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl"
                    variant="ghost"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add task
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEdit} compact />
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Projects overview */}
            <DashboardCard
              title="Projects"
              action={
                <Link href="/projects">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs rounded-xl gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {projects.length === 0 ? (
                <div className="text-center py-4">
                  <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No projects yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Add tasks with categories to see projects here</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {projects.map(([name, { total, done }]) => {
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground truncate">{name}</span>
                          <span className="text-muted-foreground ml-2 flex-shrink-0">{done}/{total}</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </DashboardCard>

            {/* Quick tip */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-4">
              <div className="flex gap-2.5">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">Quick tip</p>
                  <p className="text-xs text-primary/70 mt-0.5 leading-relaxed">
                    Browse your memory files and docs from the sidebar to stay in context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
