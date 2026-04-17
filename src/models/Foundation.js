import mongoose from "mongoose";

const InitiativeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true }
});

const SupportOptionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    buttonText: { type: String },
    isActive: { type: Boolean, default: true }
});

const FoundationSchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
    
    // Mission & Brand
    logo: { type: String },
    tamilTitle: { type: String },
    englishTitle: { type: String },
    missionDescription: { type: String },
    foundationEmail: { type: String },
    
    // Arrays
    initiatives: [InitiativeSchema],
    supportOptions: [SupportOptionSchema]
}, { 
    timestamps: true,
    collection: "foundation" 
});

export default mongoose.models.Foundation || mongoose.model("Foundation", FoundationSchema);
