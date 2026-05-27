import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { decryptPassword } from "@/lib/crypto";
import nodemailer from "nodemailer";

/**
 * Sends an email using the SMTP settings configured in the database.
 * 
 * @param {Object} options
 * @param {string} [options.fromName] - Custom display name for the sender
 * @param {string} options.replyTo - reply-to email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content of the email
 * @returns {Promise<{success: boolean, messageId?: string, simulated?: boolean}>}
 */
export async function sendEmail({ fromName, replyTo, subject, html }) {
  await connectToDatabase();
  const settingsDoc = await Setting.findOne({});
  const smtp = settingsDoc?.smtp;

  if (!smtp?.host || !smtp?.user || !smtp?.pass) {
    console.warn("[Email Dispatch] SMTP Server settings are unconfigured.");
    return {
      success: false,
      simulated: true,
      message: "SMTP not configured"
    };
  }

  const decryptedPass = decryptPassword(smtp.pass) || smtp.pass;

  const encryption = (smtp.encryption || "tls").toLowerCase().trim();
  const port = parseInt(smtp.port) || 587;

  // Determine secure mode:
  // - true  → SSL/TLS handshake from the start (port 465)
  // - false → plain connection upgraded via STARTTLS (port 587)
  const isSecure = encryption === "ssl" && port === 465;

  // Force STARTTLS when using port 587 with tls encryption
  const requireTLS = (encryption === "tls" || (encryption === "ssl" && port === 587));

  const transportOptions = {
    host: smtp.host?.trim().replace(/\.$/, ""), // strip accidental trailing dot
    port,
    secure: isSecure,
    auth: {
      user: smtp.user,
      pass: decryptedPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  if (requireTLS && !isSecure) {
    transportOptions.requireTLS = true;
  }

  const transporter = nodemailer.createTransport(transportOptions);

  const displayName =smtp.senderName || "Vidyasthanam Portal";
  const mailOptions = {
    from: `"${displayName}" <${smtp.fromEmail || smtp.user}>`,
    replyTo,
    to: smtp.toEmail || smtp.fromEmail || smtp.user,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email dispatched successfully. Message ID:", info.messageId);

  return {
    success: true,
    messageId: info.messageId,
  };
}
