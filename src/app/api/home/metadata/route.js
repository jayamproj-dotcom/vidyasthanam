import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();
    let home = await Home.findOne({});
    
    // Auto-seed if empty
    if (!home || !home.title) {
        const defaultMetadata = {
            title: "Vidyasthanam - School of Indian Music, Culture and Languages",
            description: "Learn Carnatic, Hindustani, Veena, Vocal, and Languages in Chennai and Montréal.",
            keywords: "Music, Veena, Sanskrit, Tamil, Hindi, French, Chennai, Montreal",
            isActive: true
        };
        
        home = await Home.findOneAndUpdate(
            {},
            { $set: defaultMetadata },
            { upsert: true, new: true }
        );
    }

    return NextResponse.json({ 
        success: true, 
        data: {
            title: home.title,
            description: home.description,
            keywords: home.keywords,
            isActive: home.isActive
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
