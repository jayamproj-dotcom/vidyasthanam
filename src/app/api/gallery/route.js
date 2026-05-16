import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { saveBase64Image } from "@/lib/upload";

import { getGalleryData } from "@/lib/services/dataService";

export async function GET() {
  const result = await getGalleryData();
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result, { status: 500 });
}


export async function PUT(request) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const body = await request.json();
    await connectToDatabase();

    const allowedFields = [
      "metaTitle",
      "metaKeywords",
      "metaDescription",
      "isActive",
      "images",
    ];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    // 🖼️ Process images to save to filesystem
    if (update.images && Array.isArray(update.images)) {
      for (let i = 0; i < update.images.length; i++) {
        const item = update.images[i];
        if (item.src && item.src.startsWith("data:image")) {
          // Save to user-requested folder
          update.images[i].src = await saveBase64Image(
            item.src,
            "uploads/gallery"
          );
        }
      }
    }

    const doc = await Gallery.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    revalidateTag("gallery-data");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/gallery]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
