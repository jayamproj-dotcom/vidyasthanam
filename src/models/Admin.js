import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  }
});

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema, "admin");