import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { generateRegistrationEmailHtml } from "@/lib/emailTemplate";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, dob, gender, address, phone, email, message, recaptchaToken } = body;

    if (!name || !dob || !gender || !address || !phone || !email) {
      return NextResponse.json(
        { success: false, message: "All mandatory fields are required." },
        { status: 400 }
      );
    }

    if (!recaptchaToken) {
      return NextResponse.json(
        { success: false, message: "Missing anti-spam validation challenge payload." },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6Ldep-ksAAAAAOJWTuHDIkvDONIF5A3xA0PBP-Gt";
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${recaptchaToken}`,
    });
    
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      console.warn("[Registration Security Verification] Google API challenge rejected payload context:", verifyData);
      return NextResponse.json(
        { success: false, message: "Security challenge rejected. Please confirm authentication verification." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const setting = await Setting.findOne({});
    const senderName = setting?.smtp?.senderName 
      ? `${setting.smtp.senderName} (Admissions)` 
      : "Vidyasthanam Admissions";

    const htmlContent = generateRegistrationEmailHtml({ name, dob, gender, address, phone, email, message });
    const subject = `New Student Registration: ${name}`;

    const emailResult = await sendEmail({
      replyTo: email,
      subject,
      html: htmlContent
    });

    if (emailResult.simulated) {
      console.warn("[Registration Dispatch] SMTP Server settings unconfigured.");
      return NextResponse.json({
        success: true,
        message: "Registration profile recorded securely! We will reach out shortly."
      });
    }

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: "Failed to dispatch registration email. Please verify SMTP gateway status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration profile submitted successfully! We will reach out shortly."
    });

  } catch (err) {
    console.error("[POST /api/registration/send]", err);
    return NextResponse.json(
      { success: false, message: "Failed to dispatch registration email. Please verify SMTP gateway status." },
      { status: 500 }
    );
  }
}
