import { connectToDatabase } from "@/lib/mongodb";
import Home from "@/models/Home";

export async function GET() {
  try {
    await connectToDatabase();

    const homeData = await Home.findOne({});

    if (!homeData) {
      return Response.json({
        success: false,
        message: "Home data not found",
      });
    }

    return Response.json({
      success: true,
      data: homeData,
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
