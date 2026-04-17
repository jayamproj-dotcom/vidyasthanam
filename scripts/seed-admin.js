import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../src/models/Admin.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seedAdmin() {
  try {
    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI not defined");
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin@123", 10);

    const admin = await Admin.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
    });

    console.log("✅ Admin created successfully!");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔑 Password: admin@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedAdmin();