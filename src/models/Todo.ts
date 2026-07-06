import mongoose, { Schema, Document } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  dueDate: Date | null;
  tags: string[];
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
    addedBy?: { userId: string; name: string; avatar?: string };
    completedBy?: { userId: string; name: string; avatar?: string } | null;
  }[];
  sharedWith: {
    userId: string;
    permission: "view" | "edit" | "admin";
    sharedAt: Date;
  }[];
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskUserSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: "" },
}, { _id: false });

const SubtaskSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  addedBy: { type: SubtaskUserSchema, default: null },
  completedBy: { type: SubtaskUserSchema, default: null },
});

const SharedWithSchema = new Schema({
  userId: { type: String, required: true },
  permission: {
    type: String,
    enum: ["view", "edit", "admin"],
    default: "view",
  },
  sharedAt: { type: Date, default: Date.now },
});

const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: { type: String, default: "general", trim: true },
    dueDate: { type: Date, default: null },
    tags: [{ type: String, trim: true }],
    subtasks: [SubtaskSchema],
    sharedWith: [SharedWithSchema],
    order: { type: Number, default: 0 },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

TodoSchema.index({ userId: 1, completed: 1, priority: 1, order: 1 });
TodoSchema.index({ "sharedWith.userId": 1 });

// Delete cached model in dev to pick up schema changes
if (mongoose.models.Todo) {
  delete mongoose.models.Todo;
}

export default mongoose.model<ITodo>("Todo", TodoSchema);
