import * as dotenv from 'dotenv';
dotenv.config()

import express, { type Request, type Response } from "express";
import { createServer } from "http";
import helmet from 'helmet';
import cors from "cors";

import { envConfig } from './config/env.config.ts';
import passport from './middleware/passport.ts';
import connectDB from './utils/db.ts';
import { formParser } from './middleware/multer.ts';
import sender from './utils/mailer.ts';
import adminRouter from './routes/admin.routes.ts';
import articlesRouter from './routes/articles.routes.ts';
import partnerRouter from './routes/partners.routes.ts';

const {PORT, frontendURL,mongoUri } = envConfig

const app = express()

const corsOptions = {
	origin: frontendURL ,
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

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(helmet());

app.get("/", (req: Request, res: Response) => {
	res.send("API is running...");
});

	(async () => {
		if (mongoUri) {try{
			await connectDB(mongoUri)

			console.log("Connected to the database successfully.");
		} catch (err) {
			console.error("Failed to connect to the database:", err);
			process.exit(1);
		}
	}else {
			console.warn("Skipping DB connect because mongoUri is empty.");
		}
	})()

	app.use("/api/sendEmail", formParser, sender);
app.use("/api", adminRouter);
app.use("/api", articlesRouter);
app.use("/api", partnerRouter);

app.use((err: Error, req: Request, res: Response, next: Function) => {
	console.error(err.stack);
	res.status(500).send({ message: err.message });
});

app.use((req: Request, res: Response) => {
	res.status(404).send({ message: "Endpoint not found" });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	process.on('unhandledRejection', (reason, promise) => {
		console.error('Unhandled Rejection at:', promise, 'reason:', reason);
	});
});