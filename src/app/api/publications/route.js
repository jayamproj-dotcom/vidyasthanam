import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Publication from "@/models/Publication";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

import { getPublicationsData } from "@/lib/services/dataService";

export async function GET() {
  const result = await getPublicationsData();
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
      "publications",
      "resources",
    ];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const doc = await Publication.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    revalidateTag("publications-data");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/publications]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
