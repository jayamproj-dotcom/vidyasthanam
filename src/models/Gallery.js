import mongoose from "mongoose";

const GalleryItemSchema = new mongoose.Schema({
    src: { type: String, required: true },
    alt: { type: String },
    isActive: { type: Boolean, default: true }
});

const GallerySchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
    images: [GalleryItemSchema],
}, { 
    timestamps: true,
    collection: "gallery" 
});

export default mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);
