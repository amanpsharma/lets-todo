import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  userId: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: String, required: true, index: true },
    content: { type: String, default: "" },
    color: { type: String, default: "yellow" },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (mongoose.models.Note) {
  delete mongoose.models.Note;
}

export default mongoose.model<INote>("Note", NoteSchema);
