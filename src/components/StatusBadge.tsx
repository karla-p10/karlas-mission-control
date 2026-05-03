import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/store";
import { Circle, Clock, CheckCircle2, Hourglass } from "lucide-react";

const statusConfig: Record<TaskStatus, {
  label: string;
  bg: string;
  text: string;
  Icon: React.ElementType;
}> = {
  "inbox":       { label: "Inbox",       bg: "bg-[#F0EBE1]",   text: "text-[#6B6355]",   Icon: Circle       },
  "in-progress": { label: "In Progress", bg: "bg-[#F0E8DC]",   text: "text-[#8B7355]",   Icon: Clock        },
  "waiting":     { label: "Waiting",     bg: "bg-amber-50",    text: "text-amber-700",   Icon: Hourglass    },
  "done":        { label: "Done",        bg: "bg-emerald-50",  text: "text-emerald-700", Icon: CheckCircle2 },
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig["inbox"];
  const { label, bg, text, Icon } = config;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        bg,
        text,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
