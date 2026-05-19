require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const connectDB = require("./config/db");

async function run() {
  console.log("Connecting to DB...");
  await connectDB();

  console.log("Creating mock product...");
  const mockProduct = new Product({
    name: "Test Product",
    mrp: 1000,
    salePrice: 800,
    category: "Punjabi",
    description: "This is a diagnostic product",
    imageUrls: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    variants: [{ size: "M", stock: 10 }],
    tags: ["Test", "Diagnostic"],
    details: {
      fabric: "Cotton"
    }
  });

  try {
    const saved = await mockProduct.save();
    console.log("Product saved successfully!", saved._id);
    
    // Clean up
    await Product.findByIdAndDelete(saved._id);
    console.log("Cleaned up test product.");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("FAILED to save product:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

run();
