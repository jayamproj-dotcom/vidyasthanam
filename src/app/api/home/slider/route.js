import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";

// ✅ GET - Public (no token needed)
export async function GET() {
  try {
    await connectToDatabase();

    const home = await Home.findOne({}).select("slider");

    if (!home || !home.slider) {
      return Response.json({
        success: true,
        data: {
          title: "",
          desc: "",
          slides: [],
          isActive: true,
        },
      });
    }

    return Response.json({
      success: true,
      data: {
        title: home.slider.title || "",
        desc: home.slider.desc || "",
        slides: home.slider.slides || [], // Fallback for old documents
        isActive: home.slider.isActive ?? true,
      },
    });
  } catch (error) {
    console.error("Error fetching slider:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ✅ PATCH - Protected (token required)
export async function PATCH(req) {
  try {
    // verify token
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    if (!token) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    jwt.verify(token, process.env.JWT_SECRET);

    const { title, desc, slides, isActive } = await req.json();

    if (!title || !desc) {
      return Response.json(
        { success: false, message: "Title and description are required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    let savedSlides = slides || [];

    // If slides exist with new images, save them to filesystem
    if (slides && slides.length > 0) {
      const { saveBase64Image } = await import("@/lib/upload");

      savedSlides = await Promise.all(
        slides.map(async (slide) => {
          // Check if the image is a base64 string (new upload) or already a URL/path
          if (slide.image && slide.image.startsWith("data:image")) {
            const savedImage = await saveBase64Image(
              slide.image,
              "uploads/slider",
            );
            return {
              ...slide,
              image: savedImage,
            };
          }
          return slide;
        }),
      );
    }

    const updated = await Home.findOneAndUpdate(
      {},
      {
        $set: {
          "slider.title": title,
          "slider.desc": desc,
          "slider.slides": savedSlides,
          "slider.isActive": isActive ?? true,
        },
        $unset: {
          "slider.images": "", // Remove the old field if it exists
        },
      },
      { returnDocument: "after", runValidators: true, upsert: true },
    ).select("slider");

    if (!updated || !updated.slider) {
      return Response.json(
        { success: false, message: "Failed to update slider data" },
        { status: 500 },
      );
    }
    
    // ✅ Revalidate affected pages and data tags
    revalidateTag("home-data");

    return Response.json({
      success: true,
      message: "Slider updated successfully",
      data: {
        title: updated.slider.title,
        desc: updated.slider.desc,
        slides: updated.slider.slides || [], // Ensure slides is returned
        isActive: updated.slider.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating slider:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
