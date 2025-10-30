import { Request, Response } from "express";
import { DocumentModel } from "../models/Document.model.js";

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const title = req.body.title;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const doc = await DocumentModel.create({
      title: title.trim(),
      fileName: file.originalname,
      data: file.buffer,
      mimetype: file.mimetype,
    });

    res.status(201).json({ message: "Document saved", id: doc._id });
  } catch (err) {
    console.error("uploadDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params.id;
    const doc = await DocumentModel.findById(docId);

    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.set({
      'Content-Type': doc.mimetype,
      'Content-Disposition': `attachment; filename="${doc.fileName}"`,
    });
    res.send(doc.data);
  } catch (err) {
    console.error("getDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const listDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await DocumentModel.find({}, { data: 0 })
      .sort({ uploadDate: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error("listDocuments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};