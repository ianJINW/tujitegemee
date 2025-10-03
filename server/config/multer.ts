import multer, { memoryStorage, type Multer } from "multer";
import { v2 as cloudinary } from "cloudinary";
import type { RequestHandler } from "express";
import path from "path";




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
    timeout: 60000
});

export { cloudinary };

// Create multer instance with memory storage for handling file uploads
const uploads = multer({
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Export middleware for different use cases
export const formParser: RequestHandler = uploads.none(); // For forms without files
export const fileUpload: RequestHandler = uploads.single('media'); // For single file upload 

export default uploads;