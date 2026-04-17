import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();

    let doc = await Contact.findOne();
    
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[GET /api/contact]", err);
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
      "metaTitle", "metaKeywords", "metaDescription", "isActive", "title", "description", "phone1", "phone1Note", "phone2", "phone2Note", "email"
    ];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const doc = await Contact.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    revalidateTag("contact-data");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/contact]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
