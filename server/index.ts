import * as dotenv from "dotenv";
dotenv.config();

import express, { type Request, type Response } from "express";
import { createServer } from "http";
import helmet from 'helmet';
import cors from "cors";
import connectDB from "./utils/db.ts";
import adminRouter from "./routes/admin.routes.ts";
import articlesRouter from "./routes/articles.routes.ts";
import partnerRouter from "./routes/partners.routes.ts";
import { formParser } from "./middleware/multer.ts";
import passport from "./middleware/passport.ts";
import { envConfig } from './config/env.config.ts';
import sender from "./utils/mailer.ts";

const { PORT, frontendURL, mongoUri } = envConfig;

console.log("Frontend URL from envConfig:", frontendURL);
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

// Replace existing cors setup with explicit options to allow the request header causing the preflight failure
const corsOptions = {
	origin: frontendURL,
	credentials: true,
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"Accept",
		"Origin",
		"Access-Control-Allow-Origin",
		"access-control-allow-origin"
	],
	methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
	optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Ensure preflight OPTIONS requests are handled with the same CORS policy
app.use((req: Request, res: Response, next) => {
	if (req.method === "OPTIONS") {
		// run the cors middleware for preflight requests without registering a path pattern
		cors(corsOptions)(req, res, next);
	} else {
		next();
	}
});

// Call helmet with an any-cast to avoid TypeScript "no call signatures" in some build setups
app.use((helmet as any)());

/* // Compute uploads path in an ESM-compatible way instead of import.meta.dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "uploads");
console.log("Serving uploads from:", uploadsPath);

// Ensure uploads directories exist
import fs from "fs";
const articlesPath = path.join(uploadsPath, "articles");
const partnersPath = path.join(uploadsPath, "partners");
fs.mkdirSync(articlesPath, { recursive: true });
fs.mkdirSync(partnersPath, { recursive: true });

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsPath)); */

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