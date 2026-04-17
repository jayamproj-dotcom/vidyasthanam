import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { tag } = await req.json();

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Tag is required" },
        { status: 400 }
      );
    }

    revalidateTag(tag, "max");

    return NextResponse.json({
      success: true,
      revalidated: true,
      tag,
      now: Date.now(),
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}