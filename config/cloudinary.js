import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ||"dbgvwi4lv",
  api_key: process.env.CLOUDINARY_API_KEY||"732377679595398",
  api_secret: process.env.CLOUDINARY_API_SECRET||"oyLob6uNKDjus5pwqff-x6Qgmxw",
});

export default cloudinary;
