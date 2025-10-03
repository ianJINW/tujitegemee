import nodemailer from "nodemailer";
import type { Request, Response } from "express";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: Number(process.env.SMTP_PORT) || 587,
	secure: process.env.SMTP_PORT_SECURE === "true" ? true : false,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
	tls: {
		rejectUnauthorized: false,
	},
}); 

const sender = async (req: Request, res: Response) => {
	try {
		// Validate request body
		if (!req.body) {
			return res.status(400).json({
				status: false,
				message: "Request body is missing"
			});
		}

		const { email, message } = req.body;

		// Validate required fields
		if (!email || !message) {
			return res.status(400).json({
				status: false,
				message: "Email and message are required"
			});
		}

		const to = process.env.EMAIL_USER;
		if (!to) {
			throw new Error("EMAIL_USER environment variable is not set");
		}

		const mail = {
			from: `"Tujitegemee Contact" <${process.env.EMAIL_USER}>`,
			to,
			replyTo: email,
			subject: `New Contact Message from ${email}`,
			text: message,
			html: `<p>${message}</p><p><br>From: ${email}</p>`,
		};

		// Verify transporter connection
		await transporter.verify();

		// Send email
		const info = await transporter.sendMail(mail);
		console.log("Email sent successfully:", info.messageId);

		return res.status(200).json({
			status: true,
			message: "Email sent successfully",
			messageId: info.messageId
		});

	} catch (err: unknown) {
		console.error("Email sending error:", err);
		return res.status(500).json({
			status: false,
				message: err instanceof Error ? err.message : "Failed to send email"
			});
	}
};

export default sender;