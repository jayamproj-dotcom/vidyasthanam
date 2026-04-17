import mongoose from "mongoose";

const StorySectionSchema = new mongoose.Schema({
    images: [{ type: String }],
    desc: { type: String },
});

const TimelineSchema = new mongoose.Schema({
    year: { type: String, required: true },
    text: { type: String, required: true },
    side: { type: String, default: "left" }, 
    isActive: { type: Boolean, default: true },
});

const GalleryItemSchema = new mongoose.Schema({
    src: { type: String, required: true },
    alt: { type: String },
    category: { type: String },
    isActive: { type: Boolean, default: true },
});

const AboutSchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    storySections: [StorySectionSchema],
    timeline: [TimelineSchema],
    timelineBg: { type: String },
    gallery: [GalleryItemSchema],
    isActive: { type: Boolean, default: true },
}, { 
    timestamps: true,
    collection: "about" // Explicitly forcing the collection name to be "about"
});

export default mongoose.models.About || mongoose.model("About", AboutSchema);
