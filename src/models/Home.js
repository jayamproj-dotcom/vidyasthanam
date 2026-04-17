import mongoose from "mongoose";
// Updated schema to include isActive status for Teachers and Courses

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  desc: { type: String, required: true },
  avatar: { type: String, required: false },
  isActive: { type: Boolean, default: true },
});

const CourseSchema = new mongoose.Schema({
  icon: { type: String, required: false },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  points: [{ type: String }],
  isActive: { type: Boolean, default: true },
});

const VideoSchema = new mongoose.Schema({
  link: { type: String, required: true },
  date: {
    day: { type: String, required: true },
    month: { type: String, required: true },
  },
  desc: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

// New Slide Schema for slider
const SlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const HomeSchema = new mongoose.Schema(
  {
    title: { type: String, required: false },
    description: { type: String, required: false },
    keywords: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    slider: {
      title: { type: String, required: false },
      desc: { type: String, required: false },
      slides: [SlideSchema], // Changed from images array to slides array
      isActive: { type: Boolean, default: true },
    },
    about: {
      title: { type: String, required: false },
      desc: { type: String, required: false },
      images: [{ type: String }],
      isActive: { type: Boolean, default: true },
    },
    teacher: {
      title: { type: String, required: false },
      desc: { type: String, required: false },
      teachers: [TeacherSchema],
      isActive: { type: Boolean, default: true },
    },
    foundation: {
      title: { type: String, required: false },
      desc: { type: String, required: false },
      images: [{ type: String }],
      isActive: { type: Boolean, default: true },
    },
    course: {
      title: { type: String, required: false },
      desc: { type: String, required: false },
      bgImage: { type: String, required: false },
      courses: [CourseSchema],
      isActive: { type: Boolean, default: true },
    },
    events: {
      title: { type: String, required: false },
      desc: { type: String, required: false },
      videos: [VideoSchema],
      isActive: { type: Boolean, default: true },
    },
    journey: {
      title: { type: String, required: false },
      desc: { type: String, required: false },
      isActive: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export default mongoose.models.Home || mongoose.model("Home", HomeSchema);
