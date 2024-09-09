import mongoose from "mongoose";
import connectDB from "../database/connectDB.js";
import Product from "../models/product.js";
import products from "../seeder/data.js";

const seedProducts = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    console.log("product are deleted");

    await Product.insertMany(products);
    console.log("Products are added");
    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProducts();
