"use client";

import { useState } from "react";
import { Plus, RefreshCw, Calendar as CalendarIcon, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CalendarGrid } from "@/components/CalendarGrid";
import { TaskModal } from "@/components/TaskModal";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/store";
import { format, isToday, parseISO } from "date-fns";

export default function CalendarPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { tasks } = useTasks();

  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.status !== "done")
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
    .slice(0, 5);

  return (
    <AppShell onAddTask={() => setModalOpen(true)}>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Your tasks mapped to time
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <CalendarGrid />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Google Calendar CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-blue-100">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="font-semibold text-sm text-blue-900">Google Calendar</span>
              </div>
              <p className="text-xs text-blue-700 mb-3 leading-relaxed">
                Connect to see all your events in one place. Never double-book again.
              </p>
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 text-xs"
                onClick={() => {}}
              >
                <RefreshCw className="w-3 h-3" />
                Connect Google Calendar
              </Button>
              <p className="text-[10px] text-blue-500 mt-2 text-center">Setup in Settings → Integrations</p>
            </div>

            {/* Upcoming tasks */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-display font-semibold text-sm mb-3">Upcoming</h3>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">All caught up! 🌟</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
                        <p className={`text-[11px] mt-0.5 ${
                          task.dueDate && isToday(parseISO(task.dueDate))
                            ? "text-accent font-semibold"
                            : "text-muted-foreground"
                        }`}>
                          {task.dueDate
                            ? isToday(parseISO(task.dueDate))
                              ? "Today"
                              : format(parseISO(task.dueDate), "MMM d")
                            : "No date"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info note */}
            <div className="flex gap-2 p-3 bg-muted/50 rounded-xl">
              <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tasks with due dates appear on the calendar. Click a date to filter tasks for that day.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TaskModal open={modalOpen} onOpenChange={setModalOpen} />
    </AppShell>
  );
}
