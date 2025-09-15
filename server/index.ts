import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { createServer } from "http";
import sender from "./utils/mailer.ts";
import helmet from "helmet";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || 8080;

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.use(helmet());

app.post("/sendEmail", sender);

app.get("/", (req: Request, res: Response) => {
	res.send("Server is running");
});

server.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});
