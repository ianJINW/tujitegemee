// src/index.ts  (replace your current server entry with this)
import * as dotenv from "dotenv";
dotenv.config();

import express, { type Request, type Response } from "express";
import { createServer } from "http";
import helmet from 'helmet';
import cors from "cors";
import serverless from "serverless-http";

import connectDB from "./utils/db.ts";
import adminRouter from "./routes/admin.routes.ts";
import articlesRouter from "./routes/articles.routes.ts";
import partnerRouter from "./routes/partners.routes.ts";
import { formParser } from "./middleware/multer.ts";
import passport from "./middleware/passport.ts";
import { envConfig } from './config/env.config.ts';
import sender from "./utils/mailer.ts";

const { PORT = 3000, frontendURL, mongoUri } = envConfig;

console.log("Frontend URL from envConfig:", frontendURL);

// fail fast locally but avoid throwing in serverless start (log instead)
if (!frontendURL) {
	// In dev we want to know right away; in serverless, throw can kill invocation.
	if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
		throw new Error("FRONTEND_URL is not defined in environment variables");
	} else {
		console.error("FRONTEND_URL is not defined in environment variables (serverless). Continuing but CORS may block requests.");
	}
}

if (!mongoUri) {
	if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
		throw new Error(`MONGO_URI missing`);
	} else {
		console.error("MONGO_URI missing - DB will not connect.");
	}
}

const app = express();
const server = createServer(app);

// --- CORS: run early
const corsOptions = {
	origin: frontendURL || false,
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

// Standard middlewares
app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

// Ensure preflight OPTIONS requests are handled with the same CORS policy.
// Instead of registering an OPTIONS route with a path (which can trigger
// path-to-regexp errors for some patterns), handle OPTIONS with a small
// middleware. CORS middleware runs earlier, so headers will be set.
app.use((req: Request, res: Response, next) => {
	if (req.method === 'OPTIONS') {
		// respond to preflight
		return res.sendStatus(corsOptions.optionsSuccessStatus || 204);
	}
	next();
});

// Helmet
app.use((helmet as any)());

// Safe DB connect (avoid throwing synchronously in serverless)
(async () => {
	try {
		if (mongoUri) {
			await connectDB(mongoUri);
			console.log("Connected to DB");
		} else {
			console.warn("Skipping DB connect because mongoUri is empty.");
		}
	} catch (err) {
		// log but don't throw — this avoids crashing the function on cold start
		console.error("DB connection error:", err);
	}
})();

// Logging middleware for POSTs (optional)
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

// Error handling middleware (must have 4 args)
app.use((err: Error, req: Request, res: Response, next: any) => {
	console.error("Server error:", err && (err as any).stack ? (err as any).stack : err);
	res.status(500).json({
		success: false,
		message: "Internal server error",
		error: process.env.NODE_ENV === 'development' ? (err as any).message : undefined
	});
});

// Create handler for serverless environment
const handler = process.env.VERCEL ? serverless(app) : undefined;

// --- Export for serverless (Vercel) or listen locally
if (process.env.VERCEL) {
	// When running on Vercel, the handler will be used
	console.log("Running in Vercel serverless environment - exporting handler");
} else {
	// Local / traditional server mode
	server.listen(PORT, () => {
		console.log(`Server listening on ${PORT}`);
	});

	server.on("error", (error) => {
		console.error("Server error:", error);
	});
}

export default handler;
