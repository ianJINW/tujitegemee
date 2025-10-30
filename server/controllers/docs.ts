import type { Request, Response } from "express";
import { DocumentModel } from "../models/Document.model.ts";

export const createDocument = async (req: Request, res: Response): Promise<void> => {
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

export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params.id;
    const doc = await DocumentModel.findById(docId).exec();

    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.setHeader("Content-Disposition", `attachment; filename="${doc.fileName}"`);
    res.setHeader("Content-Type", doc.mimetype);
    res.send(doc.data);
  } catch (err) {
    console.error("getDocumentById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const listDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const docs = await DocumentModel.find({}, "title uploadDate").exec();
    res.status(200).json(docs);
  } catch (err) {
    console.error("listDocuments error:", err);
    res.status(500).json({ message: "Server error" });
  } 
};

export const deleteDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params.id;
    const result = await DocumentModel.findByIdAndDelete(docId).exec();

    if (!result) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.status(200).json({ message: "Document deleted" });
  } catch (err) {
    console.error("deleteDocumentById error:", err);
    res.status(500).json({ message: "Server error" });
  } 
};