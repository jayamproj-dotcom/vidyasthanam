// v1.0.1 - Refreshed at 2026-04-14T15:07
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();
    const home = await Home.findOne({});
    return NextResponse.json({
      success: true,
      data: home?.events || { title: "", desc: "", videos: [], isActive: true },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const body = await req.json();
    await connectToDatabase();

    const updateData = {};
    if (body.title !== undefined) updateData["events.title"] = body.title;
    if (body.desc !== undefined) updateData["events.desc"] = body.desc;
    if (body.isActive !== undefined) updateData["events.isActive"] = !!body.isActive;
    
    if (body.videos) {
      updateData["events.videos"] = body.videos.map(v => ({
        ...v,
        isActive: v.isActive !== false
      }));
    }

    const updatedHome = await Home.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

    revalidateTag("home-data");
    return NextResponse.json({ success: true, data: updatedHome.events });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
