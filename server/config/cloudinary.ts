import { cloudinary } from "../middleware/multer.ts";

interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
}

const streamupload = (file: Express.Multer.File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const upload_stream = cloudinary.uploader
			.upload_stream(
				{
					upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET as string,
					resource_type: "auto",
					folder: file.mimetype.startsWith("image/") ? "images" : "media",
				},
				(error, result: CloudinaryUploadResult | undefined) => {
					if (result) {
						console.log("Successfully uploaded to Cloudinary:", {
							publicId: result.public_id,
							url: result.secure_url,
						});
						resolve(result.secure_url);
					} else {
						console.error("Cloudinary upload error:", error);
						reject(error);
					}
				}
			)
			.end(file.buffer);
	});
};

export { streamupload };
