import mongoose from "mongoose";

const VideoItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }
});

const EventItemSchema = new mongoose.Schema({
    dateLabel: { type: String, required: true },
    videos: [VideoItemSchema],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
});

const EventSchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
    events: [EventItemSchema],
}, { 
    timestamps: true,
    collection: "events" 
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
