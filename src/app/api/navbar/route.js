import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Navbar from "@/models/Navbar";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

import { getNavbarData } from "@/lib/services/dataService";

export async function GET() {
  const result = await getNavbarData();
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result, { status: 500 });
}


export async function POST(req) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const body = await req.json();
    await connectToDatabase();

    // Process image if it's base64
    if (body.bannerImage && body.bannerImage.startsWith("data:image")) {
      const { saveBase64Image } = await import("@/lib/upload");
      body.bannerImage = await saveBase64Image(body.bannerImage, "uploads/banners");
    }

    const navItem = await Navbar.create(body);
    revalidateTag("navbar-data");
    return NextResponse.json({ success: true, data: navItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const { id, ...updateData } = await req.json();
    await connectToDatabase();

    // Process image if it's base64
    if (updateData.bannerImage && updateData.bannerImage.startsWith("data:image")) {
      const { saveBase64Image } = await import("@/lib/upload");
      updateData.bannerImage = await saveBase64Image(updateData.bannerImage, "uploads/banners");
    }

    const updated = await Navbar.findByIdAndUpdate(id, updateData, { returnDocument: "after" });
    revalidateTag("navbar-data");
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const { id } = await req.json();
    await connectToDatabase();
    await Navbar.findByIdAndDelete(id);
    revalidateTag("navbar-data");
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
