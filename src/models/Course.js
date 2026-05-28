import mongoose from "mongoose";

const CourseItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: false },
    fees: { type: String, required: false },
    // desc: { type: String, required: false },
    // icon: { type: String, required: false, default: "fas fa-music" },
    points: [{ type: String }],
    paymentInfo: [{ type: String }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
});

const CourseSchema = new mongoose.Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
    courses: [CourseItemSchema],
}, {
    timestamps: true,
    collection: "course"
});

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
