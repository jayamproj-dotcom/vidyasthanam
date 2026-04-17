import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const formData = await request.json();
    const { file, fileName, type } = formData;

    if (!file || !fileName) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Only allow PDF for publications
    if (type === 'pdf' && !fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Base directory for uploads
    const baseDir = path.join(process.cwd(), "public", "uploads", "events");
    
    // Ensure directory exists
    await mkdir(baseDir, { recursive: true });

    // Clean filename
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = path.join(baseDir, cleanFileName);

    // Write file
    const buffer = Buffer.from(file.split(",")[1], "base64");
    await writeFile(filePath, buffer);

    // Return the public path
    const publicPath = `/uploads/events/${cleanFileName}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
