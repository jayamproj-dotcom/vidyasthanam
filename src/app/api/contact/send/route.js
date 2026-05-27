import { NextResponse } from "next/server";
import { generateContactEmailHtml } from "@/lib/emailTemplate";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email_id, phone_no, subject, message, recaptchaToken } = body;

    if (!name || !email_id || !phone_no || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All input fields are required." },
        { status: 400 }
      );
    }

    if (!recaptchaToken) {
      return NextResponse.json(
        { success: false, message: "Please complete the reCAPTCHA verification to confirm your identity." },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (secretKey) {
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${recaptchaToken}`,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json(
          { success: false, message: "reCAPTCHA verification challenge failed. Please refresh the page and try again." },
          { status: 400 }
        );
      }
    }

    const htmlContent = generateContactEmailHtml({ name, email_id, phone_no, subject, message });

    // Use our common sendEmail utility
    const emailResult = await sendEmail({
      replyTo: email_id,
      subject: `New Platform Message: ${subject}`,
      html: htmlContent
    });

    if (emailResult.simulated) {
      console.log("=== SIMULATED EMAIL DISPATCH LOG ===");
      console.log("Subject:", subject);
      console.log("Content Preview:", htmlContent);
      return NextResponse.json({
        success: true,
        message: "Your submission has been securely recorded. (Relay deferred until SMTP gateway configuration is finalized)"
      });
    }

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.message || "Failed to dispatch email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (err) {
    console.error("[POST /api/contact/send]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server relay failure encountered." },
      { status: 500 }
    );
  }
}