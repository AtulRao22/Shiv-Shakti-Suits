require("dotenv").config();
const cloudinary = require("./config/cloudinary");

console.log("Testing Cloudinary configuration...");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING");

cloudinary.api.ping((error, result) => {
  if (error) {
    console.error("Cloudinary ping FAILED:", error);
    process.exit(1);
  } else {
    console.log("Cloudinary ping SUCCESSFUL:", result);
    process.exit(0);
  }
});
