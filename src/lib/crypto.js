import crypto from "crypto";

// Create a stable 32-byte key derived from the secret or fallback
const getKey = () => {
  const secret =
    process.env.JWT_SECRET || "default_secure_fallback_secret_key_2026";
  return crypto.createHash("sha256").update(secret).digest();
};

const IV_LENGTH = 16;

export function encryptPassword(text) {
  if (!text) return "";
  try {
    // If it's already in iv:encrypted format, avoid re-encrypting
    if (text.includes(":") && text.split(":")[0].length === 32) {
      return text;
    }
    // Remove all whitespace/spaces from App Password before encryption
    const cleanText = text.replace(/\s+/g, "");
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
    let encrypted = cipher.update(cleanText);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
}

export function decryptPassword(text) {
  if (!text || !text.includes(":")) return text;
  try {
    const parts = text.split(":");
    // Verify valid IV hex length
    if (parts[0].length !== 32) return text;
    const iv = Buffer.from(parts.shift(), "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return "";
  }
}
