"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  X,
  LogOut,
  FolderOpen,
  BookOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/memory", label: "Memory", icon: BookOpen },
  { href: "/docs", label: "Docs", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
  mobile?: boolean;
}

export function Sidebar({ onClose, mobile }: SidebarProps) {
  const pathname = usePathname();
  const tasks = useTasks((s) => s.tasks);
  const { user, profile, signOut } = useAuth();

  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  // Display name: profile.display_name > user.user_metadata.name > email prefix > "You"
  const displayName =
    profile?.display_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "You";

  const displayEmail = profile?.email || user?.email || "";

  // Avatar initial
  const initial = displayName.charAt(0).toUpperCase();

  // Avatar URL from profile or OAuth provider
  const avatarUrl =
    profile?.avatar_url ||
    (user?.user_metadata?.avatar_url as string | undefined) ||
    null;

  return (
    <aside className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64">
      {/* Logo area */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {/* Rosie logo mark */}
          <div className="relative w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-primary-foreground text-lg font-display font-bold leading-none">R</span>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#C17B4A] rounded-full border-2 border-sidebar" />
          </div>
          <div>
            <div className="font-display font-bold text-sidebar-foreground text-lg leading-none">Rosie</div>
            <div className="text-[10px] text-sidebar-foreground/50 mt-0.5 tracking-widest uppercase">Mission Control</div>
          </div>
        </div>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : "")} />
              {label}
              {label === "Tasks" && activeTasks > 0 && (
                <span className={cn(
                  "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  active
                    ? "bg-primary/15 text-primary"
                    : "bg-sidebar-border text-sidebar-foreground/60"
                )}>
                  {activeTasks}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user info + logout */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2 px-1 py-1 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-foreground text-xs font-bold">{initial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</div>
            <div className="text-[11px] text-sidebar-foreground/50 truncate">{displayEmail}</div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = "/login";
            }}
            className="p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
