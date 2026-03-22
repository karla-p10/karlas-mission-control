import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function DashboardCard({ children, className, title, action }: DashboardCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border p-5 shadow-sm",
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="font-display font-semibold text-base text-foreground">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
