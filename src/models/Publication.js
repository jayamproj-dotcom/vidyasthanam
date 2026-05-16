import mongoose from "mongoose";

const DocItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});

const PublicationSchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
    publications: [DocItemSchema],
    resources: [DocItemSchema],
}, { 
    timestamps: true,
    collection: "publications" 
});

export default mongoose.models.Publication || mongoose.model("Publication", PublicationSchema);
