import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export const saveBase64Image = async (base64String, folder = "uploads") => {
  try {
    if (!base64String || !base64String.startsWith("data:image")) {
      // If it's already a URL (e.g. from a previous fetch), just return it
      return base64String;
    }

    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `${crypto.randomUUID()}.webp`;
    const uploadDir = path.join(process.cwd(), "public", folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    // Convert the image buffer to WebP and save it
    await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(filePath);

    // Return the public URL directly
    return `/${folder}/${fileName}`;
  } catch (error) {
    console.error("Upload error:", error);
    let userMessage = error.message;
    if (error instanceof SyntaxError) {
      userMessage = "Failed to parse the upload payload. The file may be too large, or the request was interrupted.";
    }
    return NextResponse.json(
      { success: false, message: userMessage },
      { status: 500 }
    );
  }
};
