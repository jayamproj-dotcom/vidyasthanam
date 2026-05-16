import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { decryptPassword } from "@/lib/crypto";
import { generateContactEmailHtml } from "@/lib/emailTemplate";

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
        body: `secret=${secretKey}&response=${recaptchaToken}`
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json(
          { success: false, message: "reCAPTCHA verification challenge failed. Please refresh the page and try again." },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();
    const settingsDoc = await Setting.findOne({});
    const smtp = settingsDoc?.smtp;

    const htmlContent = generateContactEmailHtml({ name, email_id, phone_no, subject, message });

    if (!smtp?.host || !smtp?.user || !smtp?.pass) {
      console.warn("[Contact Dispatch] SMTP Server settings are unconfigured. Request payload captured in operational logs.");
      console.log("=== SIMULATED EMAIL DISPATCH LOG ===");
      console.log("To:", smtp?.fromEmail || "Admin");
      console.log("Subject:", subject);
      console.log("Content Preview:", htmlContent);
      return NextResponse.json({
        success: true,
        message: "Your submission has been securely recorded. (Relay deferred until SMTP gateway configuration is finalized)"
      });
    }

    const decryptedPass = decryptPassword(smtp.pass) || smtp.pass;

    let nodemailer;
    try {
      nodemailer = (await import("nodemailer")).default || await import("nodemailer");
    } catch (err) {
      console.error("Nodemailer package is missing on gateway. Action required: npm install nodemailer");
      return NextResponse.json(
        { success: false, message: "Server gateway transport module unavailable. Please execute 'npm install nodemailer' in shell environments." },
        { status: 501 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: parseInt(smtp.port) || 587,
      secure: parseInt(smtp.port) === 465,
      auth: {
        user: smtp.user,
        pass: decryptedPass,
      },
    });

    const mailOptions = {
      from: `"${smtp.senderName || name}" <${smtp.fromEmail || smtp.user}>`,
      replyTo: email_id,
      to: smtp.fromEmail || smtp.user,
      subject: `New Platform Message: ${subject}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Live SMTP message dispatch verification ID:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!"
    });

  } catch (err) {
    console.error("[POST /api/contact/send]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server relay failure encountered." },
      { status: 500 }
    );
  }
}
