import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    if (!token) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return Response.json(
        { success: false, message: "Unauthorized: Session expired or invalid" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return Response.json(
        { success: false, message: "Admin not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, admin });
  } catch (error) {
    console.error("Error fetching admin profile:", error.message || error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
