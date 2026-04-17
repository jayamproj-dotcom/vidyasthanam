import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
}, { 
    timestamps: true,
    collection: "registration" 
});

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
