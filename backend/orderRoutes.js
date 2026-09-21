import express from "express";
import auth from "../middleware/auth.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { items, address, paymentMethod = "Cash on Delivery" } = req.body;
    if (!items?.length || !address) {
      return res.status(400).json({ message: "Items and address are required" });
    }

    let totalAmount = 0;
    const finalItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      totalAmount += product.price * item.quantity;
      finalItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items: finalItems,
      totalAmount,
      address,
      paymentMethod
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/my", auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

export default router;
