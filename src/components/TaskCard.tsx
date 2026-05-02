"use client";

import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { MoreHorizontal, Calendar, User, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store";
import { useTasks } from "@/lib/store";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatDueDate(dateStr: string) {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

function dueDateColor(dateStr: string, isDone: boolean) {
  if (isDone) return "text-muted-foreground";
  const date = parseISO(dateStr);
  if (isPast(date) && !isToday(date)) return "text-destructive font-semibold";
  if (isToday(date)) return "text-accent font-semibold";
  return "text-muted-foreground";
}

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

export function TaskCard({ task, onEdit, compact }: TaskCardProps) {
  const { toggleTaskStatus, deleteTask } = useTasks();
  const isDone = task.status === "done";

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all",
        isDone && "opacity-60"
      )}
    >
      {/* Priority indicator */}
      {task.priority === "high" && !isDone && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-full rounded-l-none" />
      )}

      <div className="flex items-start gap-3">
        {/* Check button */}
        <button
          onClick={() => toggleTaskStatus(task.id)}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
            isDone
              ? "bg-emerald-500 border-emerald-500"
              : task.status === "in-progress"
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/40 hover:border-primary"
          )}
        >
          {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          {task.status === "in-progress" && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium text-foreground leading-snug",
            isDone && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>

          {task.description && !compact && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <CategoryBadge category={task.category} showEmoji />

            {!compact && <StatusBadge status={task.status} />}

            {task.dueDate && (
              <span className={cn("flex items-center gap-1 text-xs", dueDateColor(task.dueDate, isDone))}>
                <Calendar className="w-3 h-3" />
                {formatDueDate(task.dueDate)}
              </span>
            )}

            {task.assignee && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                {task.assignee}
              </span>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-7 h-7 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground hover:bg-accent flex-shrink-0 flex items-center justify-center"
            aria-label="Task actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => toggleTaskStatus(task.id)}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
              {isDone ? "Reopen" : task.status === "inbox" ? "Start" : "Complete"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
