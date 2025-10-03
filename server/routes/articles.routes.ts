import { Router } from "express";
import {
	createArticle,
	getArticles,
	getArticleById,
	updateArticle,
	deleteArticle,
} from "../controllers/articles.ts";
import uploads from "../config/multer.ts";

const articlesRouter = Router();

articlesRouter
	.route("/articles")
	.get(getArticles)
	.post(uploads.single("article"), createArticle);
articlesRouter
	.route("/articles/:id")
	.get(getArticleById)
	.put(updateArticle)
	.delete(deleteArticle);

export default articlesRouter;
