import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
    title: { type: String },
    description: { type: String },
    phone1: { type: String },
    phone1Note: { type: String },
    phone2: { type: String },
    phone2Note: { type: String },
    email: { type: String },
    googleMapUrl: { type: String }
}, { 
    timestamps: true,
    collection: "contact" 
});

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
