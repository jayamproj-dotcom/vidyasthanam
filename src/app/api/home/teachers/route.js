import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";

// ✅ GET - Public
export async function GET() {
  try {
    await connectToDatabase();

    const home = await Home.findOne({}).select("teacher");

    if (!home || !home.teacher) {
      return Response.json({
        success: true,
        data: { title: "", desc: "", teachers: [], isActive: true },
      });
    }

    return Response.json({ success: true, data: home.teacher });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ✅ PATCH - Protected
export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    if (!token) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    jwt.verify(token, process.env.JWT_SECRET);

    const { title, desc, teachers, isActive } = await req.json();

    // Validate only what is provided
    if (teachers && !Array.isArray(teachers)) {
      return Response.json(
        { success: false, message: "Teachers must be an array" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const updateData = {};
    if (title !== undefined) updateData["teacher.title"] = title;
    if (desc !== undefined) updateData["teacher.desc"] = desc;
    if (isActive !== undefined) updateData["teacher.isActive"] = isActive;

    if (teachers) {
      const { saveBase64Image } = await import("@/lib/upload");
      const processedTeachers = await Promise.all(
        teachers.map(async (teacher) => {
          const avatarUrl = teacher.avatar
            ? await saveBase64Image(teacher.avatar, "uploads/home/teachers")
            : "";
          return {
            ...teacher,
            avatar: avatarUrl,
            isActive: teacher.isActive === false ? false : true,
          };
        }),
      );
      console.log(
        "Saving Teachers to DB:",
        JSON.stringify(processedTeachers, null, 2),
      );
      updateData["teacher.teachers"] = processedTeachers;
    }

    const updated = await Home.findOneAndUpdate(
      {},
      { $set: updateData },
      { returnDocument: "after", runValidators: true, upsert: true },
    ).select("teacher");

    if (!updated) {
      return Response.json(
        { success: false, message: "Data not found" },
        { status: 404 },
      );
    }

    // ✅ Revalidate homepage and data tag
    revalidateTag("home-data");

    return Response.json({
      success: true,
      message: "Teachers section updated successfully",
      data: updated.teacher,
    });
  } catch (error) {
    console.error("Error updating teachers:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
