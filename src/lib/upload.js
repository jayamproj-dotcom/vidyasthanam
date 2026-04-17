import fs from "fs";
import path from "path";
import crypto from "crypto";

export const saveBase64Image = async (base64String, folder = "uploads") => {
  try {
    if (!base64String || !base64String.startsWith("data:image")) {
      // If it's already a URL (e.g. from a previous fetch), just return it
      return base64String;
    }

    const type = base64String.split(";")[0].split("/")[1];
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `${crypto.randomUUID()}.${type}`;
    const uploadDir = path.join(process.cwd(), "public", folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Return the public URL
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return `${basePath}/${folder}/${fileName}`;
  } catch (error) {
    console.error("Error saving image:", error);
    throw new Error("Failed to save image");
  }
};
