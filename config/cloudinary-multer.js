// cloudinary-multer.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js'; // Assuming cloudinary.js is configured

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'careers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'], // Include pdf format
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Only for image transformations
  }
});

// Setup the upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  }
});

export default upload;
