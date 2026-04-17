import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// ✅ GET - Public
export async function GET() {
    try {
        await connectToDatabase();
        const home = await Home.findOne({}).select("about");
        
        if (!home || !home.about) {
            return NextResponse.json({ 
                success: true, 
                data: { title: "", desc: "", images: [], isActive: true } 
            });
        }

        return NextResponse.json({ success: true, data: home.about });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

// ✅ PATCH - Protected
export async function PATCH(req) {
    try {
        const authError = await verifyAuth();
        if (authError) return authError;

        const { title, desc, images, isActive } = await req.json();

        if (!title || !desc || !images || !Array.isArray(images)) {
            return NextResponse.json({ success: false, message: "Title, description and images are required" }, { status: 400 });
        }

        await connectToDatabase();

        const { saveBase64Image } = await import("@/lib/upload");
        const savedImages = await Promise.all(
            images.map((img) => saveBase64Image(img, "uploads/about"))
        );

        const updated = await Home.findOneAndUpdate(
            {},
            { $set: { "about.title": title, "about.desc": desc, "about.images": savedImages, "about.isActive": isActive ?? true } },
            { returnDocument: "after", runValidators: true, upsert: true }
        ).select("about");

        revalidateTag("home-data");
        return NextResponse.json({
            success: true,
            message: "About section updated successfully",
            data: updated.about,
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
