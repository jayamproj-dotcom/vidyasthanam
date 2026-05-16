import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Foundation from "@/models/Foundation";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

import { getFoundationData } from "@/lib/services/dataService";

export async function GET() {
  const result = await getFoundationData();
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
      "metaTitle", "metaKeywords", "metaDescription", "isActive",
      "logo", "tamilTitle", "englishTitle", "missionDescription", "foundationEmail",
      "initiatives", "supportOptions"
    ];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    // 🖼️ Process images to save to filesystem
    const { saveBase64Image } = await import("@/lib/upload");

    // Process Logo
    if (update.logo && update.logo.startsWith("data:image")) {
      update.logo = await saveBase64Image(update.logo, "uploads/foundation");
    }

    // Process Initiatives
    if (update.initiatives && Array.isArray(update.initiatives)) {
      for (let i = 0; i < update.initiatives.length; i++) {
        const item = update.initiatives[i];
        if (item.image && item.image.startsWith("data:image")) {
          update.initiatives[i].image = await saveBase64Image(
            item.image,
            "uploads/foundation"
          );
        }
      }
    }

    const doc = await Foundation.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    revalidateTag("foundation-data");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/foundation]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
