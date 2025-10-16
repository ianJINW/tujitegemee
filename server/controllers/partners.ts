import type { Request, Response } from "express";
import Partners from "../models/Partner.model.ts";
import path from "path";
import { streamupload } from "../config/cloudinary.ts";

const createPartner = async (req: Request, res: Response) => {
	const { name } = req.body;
	const image = req.file;

	try {
		// Validate required fields
		if (!name || !name.trim()) {
			res.status(400).json({ error: "Partner name is required" });
			return;
		}

		if (!image) {
			res.status(400).json({ error: "Partner image is required" });
			return;
		}

		// Create URL-friendly path for the uploaded file
		let imageURL: string | undefined;

		try {
			imageURL = await streamupload(image)
			console.log("File saved to disk:", imageURL);
		} catch (error) {
			console.error("Error uploading media:", error);
			return res.status(500).json({ error: "Media upload error" });
		}
		const newPartner = await Partners.create({
			name: name.trim(),
			media: imageURL,
		});

		res.status(201).json({
			partner: newPartner,
			message: `Partner ${name} created successfully`,
		});

		console.log("New partner created:", newPartner);
	} catch (error: any) {
		console.error("Error creating partner:", error);

		if (error.code === 11000) {
			// MongoDB duplicate key error (unique constraint violation)
			res
				.status(409)
				.json({ error: "A partner with this name already exists" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
};

const getPartners = async (req: Request, res: Response) => {
	try {
		// Fetch all partners, sorted by creation date (newest first)
		const partners = await Partners.find().sort({ createdAt: -1 });
		res.status(200).json(partners);
	} catch (error) {
		console.error("Error fetching partners:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const getPartnerById = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const partner = await Partners.findById(id);

		if (!partner) {
			return res.status(404).json({ error: "Partner not found" });
		}

		res.status(200).json(partner);
	} catch (error: any) {
		console.error("Error fetching partner:", error);

		// Handle invalid ObjectId format
		if (error.name === "CastError") {
			return res.status(400).json({ error: "Invalid partner ID format" });
		}

		res.status(500).json({ error: "Internal server error" });
	}
};

const updatePartner = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { name } = req.body;

	try {
		// Build the updates object gradually, only including fields that are provided
		const updates: { name?: string; media?: string } = {};

		// Only update name if provided
		if (name && name.trim()) {
			updates.name = name.trim();
		}

		// Handle image upload if a new file is provided
		if (req.file) {
			// Upload new image to Cloudinary
			const imageURL = await streamupload(req.file)

			updates.media = imageURL;
		}

		// Check if there are actually updates to make
		if (Object.keys(updates).length === 0) {
			return res.status(400).json({ error: "No valid updates provided" });
		}

		// FIXED: Correct usage of findByIdAndUpdate
		// First parameter: the ID, Second parameter: the updates object
		const updatedPartner = await Partners.findByIdAndUpdate(
			id, // The document ID
			updates, // The updates to apply
			{
				new: true, // Return the updated document
				runValidators: true, // Run schema validators on update
			}
		);

		if (!updatedPartner) {
			return res.status(404).json({ error: "Partner not found" });
		}

		res.status(200).json({
			partner: updatedPartner,
			message: `Partner updated successfully`,
		});
	} catch (error: any) {
		console.error("Error updating partner:", error);

		// Handle specific error types
		if (error.name === "CastError") {
			return res.status(400).json({ error: "Invalid partner ID format" });
		} else if (error.code === 11000) {
			return res
				.status(409)
				.json({ error: "A partner with this name already exists" });
		}

		res.status(500).json({ error: "Internal server error" });
	}
};

const deletePartner = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		// FIXED: Use findByIdAndDelete correctly - pass ID directly, not as object
		const deletedPartner = await Partners.findByIdAndDelete(id);

		if (!deletedPartner) {
			return res.status(404).json({ error: "Partner not found" });
		}

		// Optional: Delete the image from Cloudinary as well to prevent orphaned files
		// You could extract the public_id from the image URL and delete it
		// This helps keep your Cloudinary storage clean

		res.status(200).json({
			message: `Partner deleted successfully`,
			deletedPartner: deletedPartner  // Include deleted partner info for confirmation
		});

	} catch (error: any) {
		console.error("Error deleting partner:", error);

		if (error.name === 'CastError') {
			return res.status(400).json({ error: "Invalid partner ID format" });
		}

		res.status(500).json({ error: "Internal server error" });
	}
};

export {
	createPartner,
	getPartners,
	getPartnerById,
	updatePartner,
	deletePartner,
};
