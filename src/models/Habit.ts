import mongoose, { Schema, Document } from "mongoose";

export interface IHabit extends Document {
  userId: string;
  title: string;
  emoji: string;
  color: string;
  frequency: "daily" | "weekly";
  completedDates: string[]; // ISO date strings "YYYY-MM-DD"
  streak: number;
  bestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    emoji: { type: String, default: "✅" },
    color: { type: String, default: "violet" },
    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },
    completedDates: [{ type: String }],
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.Habit) {
  delete mongoose.models.Habit;
}

export default mongoose.model<IHabit>("Habit", HabitSchema);
