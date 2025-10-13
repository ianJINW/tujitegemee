// src/middleware/jwt.ts
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload, type Secret } from "jsonwebtoken";

export interface AdminJwtPayload extends JwtPayload {
	adminId: string;
	email: string;
	role?: string;
}

const getJWTSecret = (): Secret => {
	const s = process.env.JWT_SECRET;
	if (!s) throw new Error("JWT_SECRET not defined");
	return s;
};

export const authToken = (req: Request, res: Response, next: NextFunction) => {
	// 1. Try header
	const authHeader = req.headers["authorization"];
	let token: string | undefined;

	if (authHeader && authHeader.startsWith("Bearer ")) {
		token = authHeader.substring(7);
	}

	// 2. If not found in header, try cookie
	if (!token && req.cookies) {
		token = req.cookies["jwt"];
	}

	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}

	try {
		const payload = jwt.verify(token, getJWTSecret()) as AdminJwtPayload;
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};
