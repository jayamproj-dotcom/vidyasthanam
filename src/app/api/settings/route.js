import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { verifyAuth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { getSettingsData } from "@/lib/services/dataService";
import { encryptPassword, decryptPassword } from "@/lib/crypto";

export async function GET() {
  await connectToDatabase();
  let doc = await Setting.findOne({});
  if (!doc) {
    doc = await Setting.create({});
  }
  const result = await getSettingsData();
  if (result.success) {
    const payload = JSON.parse(JSON.stringify(result.data || doc));
    if (payload?.smtp?.pass) {
      payload.smtp.pass = decryptPassword(payload.smtp.pass);
    }
    return NextResponse.json({ success: true, data: payload });
  }
  
  const payloadObj = JSON.parse(JSON.stringify(doc));
  if (payloadObj?.smtp?.pass) {
    payloadObj.smtp.pass = decryptPassword(payloadObj.smtp.pass);
  }
  return NextResponse.json({ success: true, data: payloadObj });
}

export async function PUT(request) {
  try {
    const authError = await verifyAuth();
    if (authError) return authError;

    const body = await request.json();
    await connectToDatabase();

    const update = {};
    if (body.smtp !== undefined) {
      update.smtp = { ...body.smtp };
      if (update.smtp.pass) {
        update.smtp.pass = encryptPassword(update.smtp.pass);
      }
    }
    if (body.socialMedia !== undefined) update.socialMedia = body.socialMedia;

    const doc = await Setting.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    revalidateTag("settings-data");

    const respDoc = JSON.parse(JSON.stringify(doc));
    if (respDoc?.smtp?.pass) {
      respDoc.smtp.pass = decryptPassword(respDoc.smtp.pass);
    }

    return NextResponse.json({ success: true, data: respDoc });
  } catch (err) {
    console.error("[PUT /api/settings]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
