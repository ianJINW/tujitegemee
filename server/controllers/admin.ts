import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload, type Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.model.ts";
import type { StringValue } from "ms";

interface AdminJwtPayload extends JwtPayload {
	adminId: string;
	email: string;
}

// Helper to get the secret (throws if missing)
const getJWTSecret = (): Secret => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET must be defined");
	}
	return secret;
};

const expiresIn = (process.env.EXPIRY_TIME as StringValue) ?? "1h";

const createAdmin = async (req: Request, res: Response) => {
	const { username, email, password } = req.body;
	if (!username || !email || !password) {
		return res.status(400).json({ message: "Missing required fields" });
	}

	try {
		const existing = await Admin.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: "Email already in use" });
		}

		// Hash password before storing
		const saltRounds = 10;
		const hashed = await bcrypt.hash(password, saltRounds);

		const admin = new Admin({
			username,
			email,
			password: hashed,
			role: "admin",
		});

		await admin.save();

		return res.status(201).json({
			admin: {
				id: admin._id.toString(),
				username: admin.username,
				email: admin.email,
			},
			message: `Admin ${username} created successfully`,
		});
	} catch (error: any) {
		console.error("Error creating admin:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: "Missing fields" });
	}

	try {
		const admin = await Admin.findOne({ email });
		if (!admin) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		console.log("Found admin:", { email: admin.email, role: admin.role });

		// Debug password comparison
		console.log("Attempting password comparison...");
		const isMatch = await admin.comparePassword(password);
		console.log("Password comparison result:", isMatch);

		if (!isMatch) {
			console.log("Password comparison failed");
			return res.status(401).json({ message: "Invalid credentials" });
		}

		console.log("Login successful");

		const payload = {
			adminId: admin._id.toString(),
			email: admin.email,
		};

		const secret = getJWTSecret();

		const token = jwt.sign(payload, secret, { expiresIn });

		// Set token in cookie (HTTP only)
		res.cookie("jwt", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 1000 * 60 * 60, // 1 hour
		});
		console.log("Humman");

		// Send response with user data and token
		return res.status(200).json({
			user: {
				id: admin._id,
				email: admin.email,
				username: admin.username,
				role: admin.role,
				token: token,
			},
		});
	} catch (error: any) {
		console.error("Failed to log in:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const authenticate = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}

	try {
		const payload = jwt.verify(token, getJWTSecret()) as AdminJwtPayload;
		(req as any).admin = payload;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};

const logout = async (_req: Request, res: Response) => {
	res.clearCookie("jwt");
	return res.json({ message: "Logged out" });
};

const getAdmins = async (_req: Request, res: Response) => {
	try {
		const admins = await Admin.find().select("-password");
		return res.status(200).json({
			admins,
			message: "Admins fetched successfully",
		});
	} catch (error: any) {
		console.error("Error fetching admins:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

const getAdminById = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const admin = await Admin.findById(id).select("-password");
		if (!admin) {
			return res.status(404).json({ error: "Admin not found" });
		}
		return res.status(200).json({
			admin,
			message: `Admin ${admin.username} fetched`,
		});
	} catch (error: any) {
		console.error("Error fetching admin:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

const updateAdmin = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { username, email, password } = req.body;

	try {
		const admin = await Admin.findById(id);
		if (!admin) {
			return res.status(404).json({ error: "Admin not found" });
		}
		if (username) admin.username = username;
		if (email) admin.email = email;
		if (password) {
			const saltRounds = 10;
			admin.password = await bcrypt.hash(password, saltRounds);
		}

		await admin.save();

		const clean = admin.toObject();
		delete (clean as any).password;

		return res.status(200).json({
			admin: clean,
			message: `Admin ${admin.username} updated`,
		});
	} catch (error: any) {
		console.error("Error updating admin:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

const deleteAdmin = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const admin = await Admin.findByIdAndDelete(id);
		if (!admin) {
			return res.status(404).json({ error: "Admin not found" });
		}
		return res.status(200).json({ message: "Admin deleted successfully" });
	} catch (error: any) {
		console.error("Error deleting admin:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export {
	createAdmin,
	login,
	authenticate,
	logout,
	getAdmins,
	getAdminById,
	updateAdmin,
	deleteAdmin,
};
