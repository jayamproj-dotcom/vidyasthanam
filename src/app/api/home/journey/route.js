import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();
    let home = await Home.findOne({});

    if (!home || !home.journey) {
      return NextResponse.json({
        success: true,
        data: { title: "", desc: "", isActive: true }
      });
    }

    return NextResponse.json({ success: true, data: home.journey });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const body = await req.json();
    await connectToDatabase();

    const updatedHome = await Home.findOneAndUpdate(
      {},
      { $set: { journey: body } },
      { upsert: true, returnDocument: "after", runValidators: true }
    );

    // ✅ Revalidate affected pages and data tags
    revalidateTag("home-data");

    return NextResponse.json({ success: true, data: updatedHome.journey });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
