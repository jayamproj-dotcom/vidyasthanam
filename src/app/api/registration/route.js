import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();

    let doc = await Registration.findOne();

    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[GET /api/registration]", err);
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

    const allowedFields = ["metaTitle", "metaKeywords", "metaDescription", "isActive"];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const doc = await Registration.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    revalidateTag("registration-data");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/registration]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
