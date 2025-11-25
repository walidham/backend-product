import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" } // URL accessible publiquement
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
