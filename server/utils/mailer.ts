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
	const to = process.env.EMAIL_USER;

	const { email, message } = req.body;
	console.log({ to, email, message });

	try {
		const mail = {
			from: `"Tujitegemee Contact" <${process.env.EMAIL_USER}>`,
			to,
			replyTo: email,
			subject: `New Contact Message from ${email}`,
			text: message,
			html: `<p>${message}</p><p><br>From: ${email}</p>`,
		};

		console.log(mail);

		await transporter.sendMail(mail);

		res.status(200).json({ message: "Email sent successfully", status: true });
	} catch (err: unknown) {
		console.error(err);
		res.status(500).json({
			message: `Failed to send email: ${
				err instanceof Error ? err.message : "Unknown error"
			}`,
			status: false,
		});
	}
};

export default sender;
