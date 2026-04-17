import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return NextResponse.json(
          { success: false, message: "Unauthorized: Invalid token" },
          { status: 401 }
        );
    }
    
    return null; // Success
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Session expired or invalid" },
      { status: 401 }
    );
  }
}
