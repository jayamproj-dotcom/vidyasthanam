import mongoose from "mongoose";

const SocialMediaSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  link: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
});

const SettingSchema = new mongoose.Schema({
  smtp: {
    host: { type: String, default: "" },
    port: { type: String, default: "" },
    user: { type: String, default: "" },
    pass: { type: String, default: "" },
    fromEmail: { type: String, default: "" },
    senderName: { type: String, default: "" }
  },
  socialMedia: {
    type: [SocialMediaSchema],
    default: [
      { platform: "Facebook", link: "", isActive: true },
      { platform: "YouTube", link: "", isActive: true },
      { platform: "WhatsApp", link: "https://wa.me/919962194779", isActive: true },
      { platform: "Instagram", link: "", isActive: true },
      { platform: "Twitter", link: "", isActive: true },
      { platform: "LinkedIn", link: "", isActive: true }
    ]
  }
}, {
  timestamps: true,
  collection: "settings"
});

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
