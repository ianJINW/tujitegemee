import * as dotenv from "dotenv";
dotenv.config();

import express, { type Request, type Response } from "express";
import { createServer } from "http";
import sender from "./utils/mailer.ts";
import helmet from 'helmet';
import cors from "cors";
import connectDB from "./utils/db.ts";
import adminRouter from "./routes/admin.routes.ts";
import articlesRouter from "./routes/articles.routes.ts";
import partnerRouter from "./routes/partners.routes.ts";
import { formParser } from "./middleware/multer.ts";
import passport from "./middleware/passport.ts";
import path from "path";

import { envConfig } from './config/env.config.ts';

const { PORT, frontendURL, mongoUri } = envConfig;

if (!frontendURL) {
	throw new Error("FRONTEND_URL is not defined in environment variables");
}

if (!mongoUri) throw new Error(`MONGO_URI missing`);

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: frontendURL,
		credentials: true,
	})
);
// Apply default security headers
app.use(helmet());

// Configure Content Security Policy
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
			styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
			imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
			connectSrc: ["'self'", frontendURL],
			fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
		},
	})
);
// Set up static file serving for uploads
const uploadsPath = path.join(import.meta.dirname, "./uploads");
console.log("Serving uploads from:", uploadsPath);

// Ensure uploads directories exist
import fs from "fs";
const articlesPath = path.join(uploadsPath, "articles");
const partnersPath = path.join(uploadsPath, "partners");
fs.mkdirSync(articlesPath, { recursive: true });
fs.mkdirSync(partnersPath, { recursive: true });

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsPath));
fs.mkdirSync(partnersPath, { recursive: true });

// Serve uploads directory
app.use("/uploads", express.static(uploadsPath));

// Database connection
connectDB(mongoUri);

app.use((req: Request, res: Response, next) => {
	if (req.method === "POST") {
		console.log("Request URL:", req.url);
		console.log("Request Headers:", req.headers);
		console.log("Request Body:", req.body);
	}
	next();
});

// Routes
app.use("/api/sendEmail", formParser, sender);
app.use("/api", adminRouter);
app.use("/api", articlesRouter);
app.use("/api", partnerRouter);

// Debug middleware - move after routes
app.use((req: Request, res: Response, next) => {
	console.log("Debug - Request body:", req.body);
	next();
});

// Home route
app.get("/", (req: Request, res: Response) => {
	console.log('req.body', req.body);

	res.send("Server is running");

});
/* 

app.use('/api', (req: Request, res: Response) => {
	console.log('req.body', req.body);

	res.send("Server is running /api");
});
 */
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
	console.error("Server error:", err);
	res.status(500).json({
		success: false,
		message: "Internal server error",
		error: process.env.NODE_ENV === 'development' ? err.message : undefined
	});
});

// Server setup
server.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

server.on("error", (error) => {
	console.error("Server error:", error);
});