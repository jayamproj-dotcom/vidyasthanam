import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();
    let home = await Home.findOne({});
    
    if (!home) {
      return NextResponse.json({
        success: true,
        data: {
          title: "",
          description: "",
          keywords: "",
          isActive: true
        }
      });
    }

    return NextResponse.json({ 
        success: true, 
        data: {
            title: home.title || "",
            description: home.description || "",
            keywords: home.keywords || "",
            isActive: home.isActive ?? true
        } 
    });
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
      { $set: {
          title: body.title,
          description: body.description,
          keywords: body.keywords,
          isActive: body.isActive
      }},
      { upsert: true, returnDocument: "after", runValidators: true }
    );

    revalidateTag("home-data");
    return NextResponse.json({ 
        success: true, 
        data: {
            title: updatedHome.title,
            description: updatedHome.description,
            keywords: updatedHome.keywords,
            isActive: updatedHome.isActive
        }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
