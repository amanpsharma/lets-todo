import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  avatar: string;
  friends: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    friends: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ name: "text", email: "text" });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
