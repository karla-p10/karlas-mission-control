"use client";

import { Menu, Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/calendar": "Calendar",
  "/settings": "Settings",
};

interface TopBarProps {
  onMenuClick: () => void;
  onAddTask?: () => void;
}

export function TopBar({ onMenuClick, onAddTask }: TopBarProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Rosie";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20 flex items-center px-4 gap-3">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-muted-foreground hover:text-foreground"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page title — desktop */}
      <h1 className="font-display font-semibold text-lg text-foreground hidden lg:block">
        {title}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-auto lg:mx-0 lg:ml-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary text-sm rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Quick add */}
        {onAddTask && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-1.5 hidden sm:flex"
            onClick={onAddTask}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </Button>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full p-0.5 flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-white text-xs font-bold">K</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-semibold">Karla</div>
              <div className="text-xs text-muted-foreground">karla@family.com</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
