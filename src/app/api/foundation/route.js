import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Foundation from "@/models/Foundation";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();

    let doc = await Foundation.findOne();
    if (!doc) {
      doc = await Foundation.create({
        metaTitle: "Vidyasthanam Foundation | Promoting Hindu Heritage",
        metaKeywords: "hindu rituals, vedic traditions, foundation, donation, volunteer",
        metaDescription: "The Vidyasthanam Foundation works towards the promotion and propagation of Hindu rituals and cultural heritage.",
        isActive: true,
        logo: "/vidyasthanam/vidyasthanam-foundation-logo.png",
        tamilTitle: "வித்யாஸ்தானம் அறக்கட்டளை",
        englishTitle: "VIDYASTHANAM FOUNDATION",
        missionDescription: "Vidyasthanam Foundation was founded on January 27, 2025. The aim of the Foundation is to work towards the promotion and propagation of Hindu rituals to all the sections of the Hindu society. Our qualified and dedicated priests help perform these rituals according to the customs, practices, traditions and beliefs of the clients in a professional manner. The Foundation also deals with other aspects of Hindu heritage, customs and knowledge systems.",
        foundationEmail: "info@vidyasthanam.com",
        initiatives: [
          { title: "Ritual Education Programs", description: "Comprehensive training in Hindu rituals and ceremonies for individuals and families, explaining the significance and proper procedures.", image: "/vidyasthanam/event1.jpg", isActive: true },
          { title: "Community Outreach", description: "Bringing Hindu cultural practices to diverse communities through workshops, seminars, and participatory events.", image: "/vidyasthanam/event2.jpg", isActive: true },
          { title: "Scholarly Research", description: "Supporting academic research on Hindu traditions, rituals, and their contemporary relevance through grants and publications.", image: "/vidyasthanam/event3.jpg", isActive: true }
        ],
        supportOptions: [
          { title: "Donate", description: "Your financial support helps us continue our work in preserving and promoting Hindu rituals for all sections of society.", icon: "fas fa-hand-holding-heart", buttonText: "Make a Donation", isActive: true },
          { title: "Volunteer", description: "Join our team of dedicated volunteers and contribute your time and skills to our various initiatives and programs.", icon: "fas fa-hands-helping", buttonText: "Become a Volunteer", isActive: true },
          { title: "Partner", description: "Organizations can partner with us to bring Hindu cultural education to your community or institution.", icon: "fas fa-handshake", buttonText: "Explore Partnerships", isActive: true }
        ]
      });
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[GET /api/foundation]", err);
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
      "metaTitle", "metaKeywords", "metaDescription", "isActive",
      "logo", "tamilTitle", "englishTitle", "missionDescription", "foundationEmail",
      "initiatives", "supportOptions"
    ];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const doc = await Foundation.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    revalidateTag("foundation-data");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/foundation]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
