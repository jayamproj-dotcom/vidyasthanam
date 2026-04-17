import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import { verifyAuth } from "@/lib/auth"; 
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();

    let doc = await Course.findOne();

    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[GET /api/courses]", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
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
      "courses",
    ];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const doc = await Course.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, returnDocument: "after", runValidators: true }
    );

    revalidatePath("/courses");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/courses]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
