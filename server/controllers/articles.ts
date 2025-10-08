import type { Request, Response } from "express";
import Story from "../models/Story.model.ts";
import path from "path";

const createArticle = async (req: Request, res: Response) => {
	console.log("Request body:", req.body);
	console.log("Request file(s):", req.file, req.files);

	const { title, content } = req.body;

	let mediaUrl: string | undefined;
	if (req.file) {
		// Create URL-friendly path for the uploaded file
		mediaUrl = `/uploads/articles/${path.basename(req.file.path)}`;
		console.log("File saved to disk:", mediaUrl);
	}

	try {
		const article = await Story.create({
			title: title.trim(),
			content: content.trim(),
			media: mediaUrl,
		});

		console.log(article, `article`);

		await getArticles(req, res);

		/* 	res
			.status(201)
			.json({ article, message: `Article ${title} created successfully` }); */
	} catch (error) {
		console.error("Article creation error:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to create article",
			error: error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
};

const getArticles = async (req: Request, res: Response) => {
	try {
		const articles = await Story.find();
		res.status(200).json(articles);
	} catch (error) {
		console.error("Error fetching articles:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const getArticleById = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const article = await Story.findById(Number(id));

		if (!article) {
			return res.status(404).json({ error: "Article not found" });
		}

		res.status(200).json(article);
	} catch (error) {
		console.error("Error fetching article:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const updateArticle = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { title, content, media } = req.body;

	try {
		const updates: { title?: string, content?: string, media?: string } = {}

		if (title) updates.title = title
		if (content) updates.content = content
		if (media) updates.media = media

		const article = await Story.findByIdAndUpdate(
			Number(id),
			updates,
			{ new: true }
		);

		res
			.status(200)
			.json({ article, message: `Article ${title} updated successfully` });
	} catch (error) {
		console.error("Error updating article:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const deleteArticle = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const article = await Story.findByIdAndDelete(Number(id));

		res.status(200).json({
			article,
			message: `Article ${article?.title} deleted successfully`,
		});
	} catch (error) {
		console.error("Error deleting article:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export {
	createArticle,
	getArticles,
	getArticleById,
	updateArticle,
	deleteArticle,
};
