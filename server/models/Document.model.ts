import { Schema, model, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  title: string;
  fileName: string;
  data: Buffer;
  mimetype: string;
  uploadDate: Date;
}

const DocumentSchema = new Schema<IDocument>({
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  data: { type: Buffer, required: true },
  mimetype: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

export const DocumentModel = model<IDocument>("Document", DocumentSchema);
