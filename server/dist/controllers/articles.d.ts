import type { Request, Response } from "express";
declare const createArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getArticles: (req: Request, res: Response) => Promise<void>;
declare const getArticleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const updateArticle: (req: Request, res: Response) => Promise<void>;
declare const deleteArticle: (req: Request, res: Response) => Promise<void>;
export { createArticle, getArticles, getArticleById, updateArticle, deleteArticle, };
