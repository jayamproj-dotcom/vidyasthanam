import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.filePath.join("/");
    const absolutePath = path.join(process.cwd(), "public", "uploads", filePath);

    // Security: prevent path traversal attacks
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!absolutePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let targetPath = absolutePath;
    if (!fs.existsSync(targetPath)) {
      // Fallback for older uploads placed directly in public/uploads/ without subfolders
      const fallbackPath = path.join(uploadsDir, path.basename(absolutePath));
      if (fs.existsSync(fallbackPath)) {
        targetPath = fallbackPath;
      } else {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    const fileBuffer = fs.readFileSync(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
