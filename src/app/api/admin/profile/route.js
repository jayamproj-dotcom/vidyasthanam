import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email } = await req.json();

    if (!name || !email) {
      return Response.json({ success: false, message: "Name and email are required" }, { status: 400 });
    }

    await connectToDatabase();

    const updatedAdmin = await Admin.findByIdAndUpdate(
      decoded.id,
      { name, email },
      { returnDocument: 'after', runValidators: true } // ✅ fixed deprecation warning
    ).select("-password");

    if (!updatedAdmin) {
      return Response.json({ success: false, message: "Admin not found" }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      message: "Profile updated successfully", 
      admin: updatedAdmin 
    });

  } catch (error) {
    console.error("Error updating admin profile:", error);
    return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}