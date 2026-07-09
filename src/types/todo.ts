export interface SubtaskUser {
  userId: string;
  name: string;
  avatar?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  addedBy?: SubtaskUser;
  completedBy?: SubtaskUser | null;
}

export interface SharedWith {
  userId: string;
  permission: "view" | "edit" | "admin";
  sharedAt: string;
}

export interface Todo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  dueDate: string | null;
  recurring: "none" | "daily" | "weekly" | "monthly" | null;
  tags: string[];
  subtasks: Subtask[];
  sharedWith: SharedWith[];
  order: number;
  userId?: string;
  ownerName?: string;
  myPermission?: "view" | "edit" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  categories: string[];
  priorities: Record<string, number>;
  completionRate: number;
}
