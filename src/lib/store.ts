import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskCategory = "Home" | "Kids" | "Work" | "Personal" | "Health" | "Errands";
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  assignee?: string;
  createdAt: string;
  completedAt?: string;
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
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
    category: "Kids",
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
    category: "Errands",
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
    category: "Work",
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
    category: "Kids",
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
    category: "Home",
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
    category: "Health",
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
    category: "Kids",
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
    category: "Home",
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
    category: "Health",
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
    category: "Kids",
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
    category: "Home",
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
    category: "Personal",
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
    }),
    { name: "rosie-tasks" }
  )
);
