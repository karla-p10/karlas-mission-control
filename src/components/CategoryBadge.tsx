"use client";

import { cn } from "@/lib/utils";
import { useTasks, COLOR_MAP } from "@/lib/store";

interface CategoryBadgeProps {
  /** category id */
  category: string;
  className?: string;
  showEmoji?: boolean;
}

export function CategoryBadge({ category, className, showEmoji = false }: CategoryBadgeProps) {
  const categories = useTasks((s) => s.categories);
  const cat = categories.find((c) => c.id === category || c.name === category);

  // Fallback styles when category not found
  const style = cat ? (COLOR_MAP[cat.color] ?? COLOR_MAP.teal) : COLOR_MAP.teal;
  const label = cat ? cat.name : category;
  const emoji = cat ? cat.emoji : "📌";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        style.bg,
        style.text,
        className
      )}
    >
      {showEmoji ? (
        <span className="text-[11px]">{emoji}</span>
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", style.dot)} />
      )}
      {label}
    </span>
  );
}
