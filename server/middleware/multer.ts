import multer, { diskStorage, memoryStorage, type Multer } from "multer";
import { v2 as cloudinary } from "cloudinary";
import type { RequestHandler } from "express";
import path, { basename } from "path";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
	api_key: process.env.CLOUDINARY_API_KEY || "",
	api_secret: process.env.CLOUDINARY_API_SECRET || "",
	timeout: 60000,
});

export { cloudinary };

function sanitizeFileName(originalName: string): string {
	const ext = path.extname(originalName);
	const name = path.basename(originalName, ext);

	const maxLength = 100;
	let safeName = name;
	if (name.length > maxLength) {
		safeName = name.slice(0, maxLength);
	}
	// Optionally replace unsafe characters:
	safeName = safeName.replace(/[^a-zA-Z0-9_\-]/g, "_");

	return safeName + ext;
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Different directories for different types of uploads
		const uploadDir = file.fieldname === 'article' ? 'uploads/articles' : 'uploads/partners';
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const clean = sanitizeFileName(file.originalname);
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${unique}-${clean}`);
	},
});

// Create multer instance with memory storage for handling file uploads
const uploads = multer({
	storage: storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = allowedTypes.test(file.mimetype);

		if (extname && mimetype) {
			return cb(null, true);
		} else {
			cb(new Error("Only image files are allowed!"));
		}
	},
});

// Export middleware for different use cases
export const formParser: RequestHandler = uploads.none(); // For forms without files
export const fileUpload: RequestHandler = uploads.single("media"); // For single file upload

export default uploads;
