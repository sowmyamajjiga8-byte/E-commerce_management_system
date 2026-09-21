import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const products = [
  {name:"Wireless Headphones",description:"Bluetooth over-ear headphones",price:1999,category:"Electronics",stock:20,image:"https://via.placeholder.com/400x300?text=Headphones"},
  {name:"Smart Watch",description:"Fitness and notification smartwatch",price:2499,category:"Electronics",stock:15,image:"https://via.placeholder.com/400x300?text=Smart+Watch"},
  {name:"College Backpack",description:"Durable everyday backpack",price:999,category:"Fashion",stock:30,image:"https://via.placeholder.com/400x300?text=Backpack"},
  {name:"Java Programming Book",description:"Programming fundamentals reference",price:699,category:"Books",stock:25,image:"https://via.placeholder.com/400x300?text=Java+Book"}
];

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany({});
await Product.insertMany(products);
console.log("Sample products inserted");
await mongoose.disconnect();
