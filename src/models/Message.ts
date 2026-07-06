import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  from: string;
  to: string;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fetching conversation between two users
MessageSchema.index({ from: 1, to: 1, createdAt: -1 });
// Index for unread count queries
MessageSchema.index({ to: 1, read: 1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
