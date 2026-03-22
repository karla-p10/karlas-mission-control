import { cn } from "@/lib/utils";
import type { TaskCategory } from "@/lib/store";

const categoryStyles: Record<TaskCategory, { bg: string; text: string; dot: string }> = {
  Home:     { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400"  },
  Kids:     { bg: "bg-pink-100",    text: "text-pink-700",    dot: "bg-pink-400"   },
  Work:     { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-400"   },
  Personal: { bg: "bg-purple-100",  text: "text-purple-700",  dot: "bg-purple-400" },
  Health:   { bg: "bg-green-100",   text: "text-green-700",   dot: "bg-green-400"  },
  Errands:  { bg: "bg-orange-100",  text: "text-orange-700",  dot: "bg-orange-400" },
};

const categoryEmoji: Record<TaskCategory, string> = {
  Home:     "🏠",
  Kids:     "👧",
  Work:     "💼",
  Personal: "✨",
  Health:   "💚",
  Errands:  "🛒",
};

interface CategoryBadgeProps {
  category: TaskCategory;
  className?: string;
  showEmoji?: boolean;
}

export function CategoryBadge({ category, className, showEmoji = false }: CategoryBadgeProps) {
  const style = categoryStyles[category];
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
        <span className="text-[11px]">{categoryEmoji[category]}</span>
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", style.dot)} />
      )}
      {category}
    </span>
  );
}
