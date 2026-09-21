import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, default: "https://via.placeholder.com/400x300?text=Product" },
  stock: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
