import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  emoji: string;
  /** Tailwind color name: amber | pink | blue | purple | green | orange | teal | red | indigo | cyan */
  color: string;
}

/**
 * COLOR_MAP — literal Tailwind class strings so the compiler never purges them.
 * Kept here so all consumers share the same source of truth.
 */
export const COLOR_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  amber:  { bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-400"  },
  pink:   { bg: "bg-pink-100",   text: "text-pink-700",   dot: "bg-pink-400"   },
  blue:   { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-400"   },
  purple: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-400" },
  green:  { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-400"  },
  orange: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  teal:   { bg: "bg-teal-100",   text: "text-teal-700",   dot: "bg-teal-400"   },
  red:    { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-400"    },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-400" },
  cyan:   { bg: "bg-cyan-100",   text: "text-cyan-700",   dot: "bg-cyan-400"   },
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "home",     name: "Home",     emoji: "🏠", color: "amber"  },
  { id: "kids",     name: "Kids",     emoji: "👧", color: "pink"   },
  { id: "work",     name: "Work",     emoji: "💼", color: "blue"   },
  { id: "personal", name: "Personal", emoji: "✨", color: "purple" },
  { id: "health",   name: "Health",   emoji: "💚", color: "green"  },
  { id: "errands",  name: "Errands",  emoji: "🛒", color: "orange" },
];

// ─── Task ─────────────────────────────────────────────────────────────────────

/** category is now a category.id (string) instead of a hardcoded union */
export type TaskCategory = string;
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory; // category id
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  assignee?: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface TaskStore {
  tasks: Task[];
  categories: Category[];

  // Task actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Category actions
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: string) => void;
}

const generateId = () => Math.random().toString(36).slice(2, 9);

const today = new Date();
const fmt = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "School pickup — Emma & Jake",
    description: "Pick up from Lincoln Elementary at 3:15pm",
    category: "kids",
    status: "todo",
    priority: "high",
    dueDate: fmt(0),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Grocery run",
    description: "Trader Joe's — check the shared list",
    category: "errands",
    status: "todo",
    priority: "medium",
    dueDate: fmt(0),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t3",
    title: "Submit Q2 project proposal",
    description: "Send to Sarah by EOD",
    category: "work",
    status: "in-progress",
    priority: "high",
    dueDate: fmt(0),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t4",
    title: "Schedule Jake's dentist appointment",
    description: "He's been complaining about his tooth again",
    category: "kids",
    status: "todo",
    priority: "medium",
    dueDate: fmt(1),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t5",
    title: "Pay utility bills",
    description: "Electric + internet due this week",
    category: "home",
    status: "todo",
    priority: "high",
    dueDate: fmt(2),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t6",
    title: "30-min yoga session",
    description: "Finally. Me time.",
    category: "health",
    status: "done",
    priority: "low",
    dueDate: fmt(-1),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: "t7",
    title: "Emma's science fair poster",
    description: "Needs to be done by Friday. Volcanoes, apparently.",
    category: "kids",
    status: "in-progress",
    priority: "high",
    dueDate: fmt(3),
    assignee: "Emma",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t8",
    title: "Clean out the garage",
    description: "Long overdue. Two Saturdays minimum.",
    category: "home",
    status: "todo",
    priority: "low",
    dueDate: fmt(7),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t9",
    title: "Annual physical",
    description: "Schedule with Dr. Martinez",
    category: "health",
    status: "todo",
    priority: "medium",
    dueDate: fmt(14),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t10",
    title: "Book birthday venue",
    description: "Jake turns 8 in 6 weeks — need to act fast",
    category: "kids",
    status: "todo",
    priority: "high",
    dueDate: fmt(5),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t11",
    title: "Review HOA documents",
    description: "Annual meeting next month",
    category: "home",
    status: "done",
    priority: "low",
    dueDate: fmt(-2),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: "t12",
    title: "Lunch with Maria",
    description: "Catch up — it's been 3 months!",
    category: "personal",
    status: "todo",
    priority: "low",
    dueDate: fmt(4),
    assignee: "Karla",
    createdAt: new Date().toISOString(),
  },
];

export const useTasks = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: MOCK_TASKS,
      categories: DEFAULT_CATEGORIES,

      // ── Task actions ──────────────────────────────────────────────────────
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      toggleTaskStatus: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t;
            const next: TaskStatus =
              t.status === "todo"
                ? "in-progress"
                : t.status === "in-progress"
                ? "done"
                : "todo";
            return {
              ...t,
              status: next,
              completedAt: next === "done" ? new Date().toISOString() : undefined,
            };
          }),
        })),

      // ── Category actions ──────────────────────────────────────────────────
      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: generateId() },
          ],
        })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    { name: "rosie-tasks" }
  )
);
