import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { verifyAuth } from "@/lib/auth";

// Map type to subfolder
const TYPE_FOLDERS = {
  banner: "banners",
  pdf: "publications",
  event: "events",
  gallery: "gallery",
  about: "about",
  slider: "slider",
  foundation: "foundation",
  teacher: "teachers",
  teachers: "teachers",
};

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

    // Validate PDF type
    if (type === "pdf" && !fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Determine subfolder based on type
    const subFolder = TYPE_FOLDERS[type] || "misc";

    // Build absolute directory path
    const uploadDir = path.join(process.cwd(), "public", "uploads", subFolder);

    // Ensure the subfolder exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename to avoid overwrites
    const ext = path.extname(fileName).toLowerCase();
    const uniqueFileName = `${crypto.randomUUID()}${ext}`;

    // Full absolute path to save the file
    const absoluteFilePath = path.join(uploadDir, uniqueFileName);

    // Decode base64 and write file
    const base64Data = file.includes(",") ? file.split(",")[1] : file;
    const buffer = Buffer.from(base64Data, "base64");
    await writeFile(absoluteFilePath, buffer);

    // Public URL path (relative to /public)
    const publicPath = `/uploads/${subFolder}/${uniqueFileName}`;

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
