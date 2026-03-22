"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/store";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { tasks } = useTasks();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  function getTasksForDay(date: Date) {
    return tasks.filter(
      (t) => t.dueDate && isSameDay(parseISO(t.dueDate), date)
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-display font-semibold text-base">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border last:border-0">
            {week.map((day, di) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDay = isToday(day);

              return (
                <div
                  key={di}
                  className={cn(
                    "min-h-[80px] p-1.5 border-r border-border last:border-r-0 relative",
                    !isCurrentMonth && "bg-muted/30",
                    isTodayDay && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium mx-auto mb-1",
                    isTodayDay
                      ? "bg-primary text-white font-semibold"
                      : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                  )}>
                    {format(day, "d")}
                  </div>

                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium leading-tight",
                          task.status === "done"
                            ? "bg-emerald-100 text-emerald-700 line-through"
                            : task.priority === "high"
                            ? "bg-accent/15 text-accent"
                            : "bg-primary/10 text-primary"
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
