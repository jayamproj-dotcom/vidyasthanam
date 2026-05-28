import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { verifyAuth } from "@/lib/auth";
import { saveBase64Image } from "@/lib/upload";


export async function GET() {
  try {
    await connectToDatabase();
    const homeData = await Home.findOne({}).select("course");

    // Ensure default values if doc doesn't exist yet
    const data =
      homeData && homeData.course
        ? homeData.course
        : {
          title: "",
          desc: "",
          bgImage: "",
          courses: [],
          isActive: true,
        };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const body = await req.json();
    const { title, desc, courses, bgImage, isActive } = body;

    await connectToDatabase();

    // 1. Process Section Background (if new upload)
    let finalBgImage = bgImage || "";

    console.log(
      "Saving Courses Update. bgImage length:",
      bgImage ? bgImage.length : 0,
    );

    if (bgImage && bgImage.startsWith("data:image")) {
      console.log("Saving to uploads/home/courses...");
      finalBgImage = await saveBase64Image(bgImage, "uploads/home/courses");
      console.log("Processed image path:", finalBgImage);
    }

    // 2. Map Courses (keeping existing data)
    const processedCourses = (courses || []).map((course) => ({
      icon: course.icon,
      name: course.name,
      desc: course.desc,
      points: course.points,
      isActive: course.isActive ?? true,
    }));

    console.log("Ready to save to DB. bgImage value:", finalBgImage);

    const updated = await Home.findOneAndUpdate(
      {},
      {
        $set: {
          course: {
            title: title || "",
            desc: desc || "",
            bgImage: finalBgImage || "",
            courses: processedCourses,
            isActive: isActive ?? true,
          },
        },
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );

    console.log(
      "FULL DB Result for course:",
      JSON.stringify(updated?.course, null, 2),
    );

    // ✅ Revalidate affected pages and data tags
    revalidateTag("home-data");

    return NextResponse.json({
      success: true,
      message: "Courses updated successfully",
      data: updated.course,
    });
  } catch (error) {
    console.error("Error updating courses:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error: " + error.message },
      { status: 500 },
    );
  }
}
