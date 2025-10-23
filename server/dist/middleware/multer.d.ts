import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import type { RequestHandler } from "express";
export { cloudinary };
declare const uploads: multer.Multer;
export declare const formParser: RequestHandler;
export declare const fileUpload: RequestHandler;
export default uploads;
//# sourceMappingURL=multer.d.ts.map