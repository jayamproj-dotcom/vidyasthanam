import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/services/dataService";

export async function GET() {
  const result = await getHomeData();
  if (result.success) {
    if (!result.data) {
      return NextResponse.json({
        success: false,
        message: "Home data not found",
      });
    }
    return NextResponse.json(result);
  }
  return NextResponse.json(result, { status: 500 });
}

