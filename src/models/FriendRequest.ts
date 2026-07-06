import mongoose, { Schema, Document } from "mongoose";

export interface IFriendRequest extends Document {
  from: string;
  to: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequest>(
  {
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

FriendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

export default mongoose.models.FriendRequest ||
  mongoose.model<IFriendRequest>("FriendRequest", FriendRequestSchema);
