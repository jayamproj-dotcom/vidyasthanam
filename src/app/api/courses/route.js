import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";
import { verifyAuth } from "@/lib/auth"; 
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await connectToDatabase();

    let doc = await Course.findOne();
    // if (!doc) {
    //   doc = await Course.create({
    //     metaTitle: "Our Courses | Vidyasthanam",
    //     metaKeywords: "carnatic music, sanskrit, tamil, french, online courses",
    //     metaDescription: "Explore our wide range of professional online courses.",
    //     isActive: true,
    //     courses: [
    //       {
    //         name: "Online Carnatic Music Theory Workshop Level I",
    //         number: "VS1426",
    //         fees: "$60 CAD/$70 USD",
    //         desc: "Introduction to basic concepts in the theory of Carnatic music such as ragas, sruti, and melakartas.",
    //         icon: "fas fa-music",
    //         points: [
    //           "Faculty: Ms. Bhargavi Hariharan and Dr. R. Saraswati Sainath",
    //           "Duration: Ten classes",
    //           "Schedule: Online twice a week every Saturday and Sunday 7-8 pm EST from April 18 - May 17, 2026",
    //           "Eligibility: From age 8",
    //           "Text: Materials will be provided",
    //         ],
    //         paymentInfo: [
    //           "For payment in $CAD use interac email transfer to: vidyasthanamindiacanada@yahoo.com",
    //           "For payment in $US send an email to info@vidyasthanam.com. Bank details will be provided.",
    //         ],
    //         isActive: true,
    //         order: 0,
    //       },
    //       {
    //         name: "Online Conversational French for Québec Level I",
    //         number: "VS 1429",
    //         fees: "$100 CAD/$120 USD",
    //         desc: "Ideal for adults living in Québec or looking to immigrate.",
    //         icon: "fas fa-language",
    //         points: [
    //           "Faculty: Dr. R. Saraswati Sainath",
    //           "Duration: Ten classes",
    //           "Schedule: Online once a week every Monday 7:30-8:30 pm EST from May 11, 2026 to July 13, 2026",
    //           "Eligibility: Adults living in Québec or looking to immigrate",
    //           "Text: Information will be provided by the instructor",
    //         ],
    //         paymentInfo: [
    //           "For payment in $CAD use interac email transfer to: vidyasthanamindiacanada@yahoo.com",
    //           "For payment in $US send an email to info@vidyasthanam.com.",
    //         ],
    //         isActive: true,
    //         order: 1,
    //       },
    //       {
    //         name: "Online Conversational Tamiḻ for Kids I",
    //         number: "VS1413",
    //         fees: "$60 CAD/$70 USD",
    //         desc: "Simple conversational phrases and nursery rhymes in Tamil to facilitate kids to speak.",
    //         icon: "fas fa-child",
    //         points: [
    //           "Faculty: TBA",
    //           "Duration: Ten classes",
    //           "Schedule: Online once a week every Sunday from 9:30-10:30 am EST from May 3, 2026 to June 5, 2026",
    //           "Eligibility: Kids from the age of 3 to 8",
    //           "Text: Material will be provided",
    //         ],
    //         paymentInfo: [
    //           "For payment in $CAD use interac email transfer to: vidyasthanamindiacanada@yahoo.com",
    //           "For payment in $US send an email to info@vidyasthanam.com.",
    //         ],
    //         isActive: true,
    //         order: 2,
    //       },
    //       {
    //         name: "Online Sandhyāvandana",
    //         number: "VS 1427",
    //         fees: "$150 CAD/$160 USD",
    //         desc: "Detailed instruction on Sandhyāvandana for boys/males after upanayana.",
    //         icon: "fas fa-pray",
    //         points: [
    //           "Faculty: Sri. Narayana Sharma",
    //           "Duration: 30 classes",
    //           "Schedule: Online twice a week every Saturday and Sunday 8-9 am EST from May 16, 2026 to August 23, 2026",
    //           "Eligibility: Hindu brahmin boys and males only for whom upanayana has been performed",
    //           "Text: Information will be provided by the instructor",
    //         ],
    //         paymentInfo: [
    //           "For payment in $CAD use interac email transfer to: vidyasthanamindiacanada@yahoo.com",
    //           "For payment in $US send an email to info@vidyasthanam.com.",
    //         ],
    //         isActive: true,
    //         order: 3,
    //       },
    //       {
    //         name: "Online Sanskrit I",
    //         number: "VS1428",
    //         fees: "$144 CAD/$150 USD",
    //         desc: "Foundational Sanskrit course covering infant readers and Raghuvaṁśa selections.",
    //         icon: "fas fa-book-reader",
    //         points: [
    //           "Faculty: Dr. R. Saraswati Sainath",
    //           "Duration: Six months (24 classes)",
    //           "Schedule: Online once a week every Friday 7:30-8:30 pm EST from May 22, 2026 to October 30, 2026",
    //           "Eligibility: From age 12",
    //           "Text: Saṁskṛta Bālādarśā Infant Reader - Lessons 1-10 only. Raghuvaṁśa Canto I ślokas 1-10.",
    //         ],
    //         paymentInfo: [
    //           "For payment in $CAD use interac email transfer to: vidyasthanamindiacanada@yahoo.com",
    //           "For payment in $US send an email to info@vidyasthanam.com.",
    //         ],
    //         isActive: true,
    //         order: 4,
    //       },
    //     ],
    //   });
    // }

    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[GET /api/courses]", err);
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
      "courses",
    ];
    
    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const doc = await Course.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, returnDocument: "after", runValidators: true }
    );

    revalidatePath("/courses");
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT /api/courses]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
