import { cloudinary } from "./multer.ts";

const streamupload = (file:any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const upload_stream =cloudinary.uploader.upload_stream(
      { upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET as string },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          console.log(Error, "eRROR");
          
          reject(error);
        }
      }
    ).end(file.buffer);
    
    return upload_stream;
  });
}

export { streamupload };