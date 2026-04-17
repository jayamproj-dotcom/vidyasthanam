import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";

// ✅ GET - Public
export async function GET() {
    try {
        await connectToDatabase();

        const home = await Home.findOne({}).select("foundation");

        if (!home || !home.foundation) {
            return Response.json({
                success: true,
                data: { title: "", desc: "", images: [""], isActive: true }
            });
        }

        return Response.json({ success: true, data: home.foundation });

    } catch (error) {
        console.error("Error fetching foundation:", error);
        return Response.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

// ✅ PATCH - Protected
export async function PATCH(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("adminToken")?.value;

        if (!token) {
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        jwt.verify(token, process.env.JWT_SECRET);

        const { title, desc, images, isActive } = await req.json();

        if (!title || !desc || !images || !Array.isArray(images)) {
            return Response.json(
                { success: false, message: "Title, description and images are required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Save images to filesystem
        const { saveBase64Image } = await import("@/lib/upload");
        const savedImages = await Promise.all(
            images.map((img) => saveBase64Image(img, "uploads/foundation"))
        );

        const updated = await Home.findOneAndUpdate(
            {},
            { $set: { "foundation.title": title, "foundation.desc": desc, "foundation.images": savedImages, "foundation.isActive": isActive } },
            { returnDocument: "after", runValidators: true, upsert: true }
        ).select("foundation");

        if (!updated) {
            return Response.json(
                { success: false, message: "Data not found" },
                { status: 404 }
            );
        }

        revalidateTag("home-data");
        return Response.json({
            success: true,
            message: "Foundation section updated successfully",
            data: updated.foundation,
        });

    } catch (error) {
        console.error("Error updating foundation:", error);
        return Response.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
