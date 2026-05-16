import mongoose from "mongoose";

const NavbarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  bannerImage: { type: String, required: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });


export default mongoose.models.Navbar || mongoose.model("Navbar", NavbarSchema);
