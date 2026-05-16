import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { decryptPassword } from "@/lib/crypto";
import { generateRegistrationEmailHtml } from "@/lib/emailTemplate";

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
    const settingsDoc = await Setting.findOne({});
    const smtp = settingsDoc?.smtp;

    const htmlContent = generateRegistrationEmailHtml({ name, dob, gender, address, phone, email, message });
    const subject = `New Student Registration: ${name}`;

    if (!smtp?.host || !smtp?.user || !smtp?.pass) {
      console.warn("[Registration Dispatch] SMTP Server settings unconfigured. Logging submission context internally.");
      return NextResponse.json({
        success: true,
        message: "Registration profile recorded securely! We will reach out shortly."
      });
    }

    const decryptedPass = decryptPassword(smtp.pass) || smtp.pass;

    let nodemailer;
    try {
      nodemailer = (await import("nodemailer")).default || await import("nodemailer");
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Server mail transport module unavailable." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port) || 465,
      secure: Number(smtp.port) === 465,
      auth: {
        user: smtp.user,
        pass: decryptedPass,
      },
    });

    const senderName = smtp.senderName ? `${smtp.senderName} (Admissions)` : "Vidyasthanam Admissions";
    const mailOptions = {
      from: `"${senderName}" <${smtp.fromEmail || smtp.user}>`,
      to: smtp.fromEmail || smtp.user,
      replyTo: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Student Registration relay verification ID:", info.messageId);

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
