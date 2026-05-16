import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import About from "@/models/About";
import { verifyAuth } from "@/lib/auth";
import { saveBase64Image } from "@/lib/upload";
import { getAboutData } from "@/lib/services/dataService";

export async function GET() {
  const result = await getAboutData();
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result, { status: 500 });
}

export async function PATCH(req) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const body = await req.json();
    await connectToDatabase();

    // 🖼️ Process images in storySections
    if (body.storySections && Array.isArray(body.storySections)) {
      for (let i = 0; i < body.storySections.length; i++) {
        if (
          body.storySections[i].images &&
          Array.isArray(body.storySections[i].images)
        ) {
          for (let j = 0; j < body.storySections[i].images.length; j++) {
            const img = body.storySections[i].images[j];
            if (img && img.startsWith("data:image")) {
              body.storySections[i].images[j] = await saveBase64Image(
                img,
                "uploads/about",
              );
            }
          }
        }
      }
    }

    // 🖼️ Process images in gallery
    if (body.gallery && Array.isArray(body.gallery)) {
      for (let i = 0; i < body.gallery.length; i++) {
        const item = body.gallery[i];
        if (item.src && item.src.startsWith("data:image")) {
          body.gallery[i].src = await saveBase64Image(
            item.src,
            "uploads/about",
          );
        }
      }
    }

    // 🖼️ Process timeline background
    if (body.timelineBg && body.timelineBg.startsWith("data:image")) {
      body.timelineBg = await saveBase64Image(
        body.timelineBg,
        "uploads/about",
      );
    }

    const updated = await About.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

    // ✅ Revalidate affected pages and data tags
    revalidateTag("about-data");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH About Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
