import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();

    let doc = await Gallery.findOne();
    // if (!doc) {
    //   doc = await Gallery.create({
    //     metaTitle: "Photo Gallery | Vidyasthanam",
    //     metaKeywords: "carnatic music, veena, saraswati sainath, performances, gallery",
    //     metaDescription: "View photos from our recent performances, events, and student recitals.",
    //     isActive: true,
    //     images: [
    //       { src: "/vidyasthanam/galleryimg/photos-website/aparna-oduvar-performance.jpg", alt: "Aparna and Oduvar Performance", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/aparna-visalur-1.jpg", alt: "Performance at Visalur 1", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/aparna-visalur-2.jpg", alt: "Performance at Visalur 2", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/aparna-visalur-3.jpg", alt: "Performance at Visalur 3", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/aparna-visalur-4.jpg", alt: "Performance at Visalur 4", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/aparna-with-artists-arangetram.jpg", alt: "Aparna with Artists at Arangetram", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/aparnasainath-veena-arangetram-presentation.jpg", alt: "Veena Arangetram Presentation", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/vidyasthanam-aparna-honour.jpg", alt: "Aparna Honoured", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/vidyasthanam-oduvar-honour.jpg", alt: "Oduvar Honoured", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/aparna-republic-day-icasm.jpg", alt: "Republic Day Performance ICASM", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/vidyasthanam-oduvar-performance.jpg", alt: "Oduvar Performance", isActive: true },
    //       { src: "/vidyasthanam/galleryimg/photos-website/students-independence-day-icasm.jpg", alt: "Students Performance Independence Day", isActive: true }
    //     ]
    //   });
    // }

    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[GET /api/gallery]", err);
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
      "metaTitle",
      "metaKeywords",
      "metaDescription",
      "isActive",
      "images",
    ];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const doc = await Gallery.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    revalidateTag("gallery-data");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/gallery]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
