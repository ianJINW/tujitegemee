import type { Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import Admin from "../models/Admin.model.ts";
import type { AdminJwtPayload } from "../middleware/jwt.ts";
import { authConfig } from "../config/auth.config.ts";

export const createAdmin = async (req: Request, res: Response) => {
	const { username, email, password, role } = req.body;
	if (!username || !email || !password) {
		return res.status(400).json({ message: "Missing required fields" });
	}

	try {
		const existing = await Admin.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: "Email already in use" });
		}

		const admin = new Admin({
			username,
			email,
			password,
			role: role ?? "admin",
		});

		await admin.save();

		const safe = {
			id: admin._id,
			email: admin.email,
			username: admin.username,
			role: admin.role,
		};
		return res.status(201).json({ admin: safe, message: "Admin created" });
	} catch (err: any) {
		console.error("Error in createAdmin:", err);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: "Missing fields" });
	}
	try {
		const admin = await Admin.findOne({ email }).select("+password");
		if (!admin) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const isMatch = await admin.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const payload: AdminJwtPayload = {
			adminId: String(admin._id),
			email: admin.email,
			role: admin.role,
		};

		const token = jwt.sign(
			payload,
			Buffer.from(authConfig.jwtSecret),
			{
				expiresIn: authConfig.jwtExpiry,
			} as SignOptions
		);

		res.cookie("jwt", token, authConfig.cookieOptions);

		const safe = {
			id: admin._id?.toString(),
			email: admin.email,
			username: admin.username,
			role: admin.role,
		};

		return res.status(200).json({ user: safe, token });
	} catch (err: any) {
		console.error("Error in login:", err);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const logout = (req: Request, res: Response) => {
	res.clearCookie("jwt");
	return res.json({ message: "Logged out" });
};

export const getAdmins = async (req: Request, res: Response) => {
	try {
		const admins = await Admin.find().select("-password");
		return res.status(200).json({ admins });
	} catch (err: any) {
		console.error("Error in getAdmins:", err);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const getAdminById = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const admin = await Admin.findById(id).select("-password");
		if (!admin) {
			return res.status(404).json({ message: "Admin not found" });
		}
		return res.status(200).json({ admin });
	} catch (err: any) {
		console.error("Error in getAdminById:", err);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const updateAdmin = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { username, email, password, role } = req.body;
	try {
		const admin = await Admin.findById(id);
		if (!admin) {
			return res.status(404).json({ message: "Admin not found" });
		}
		if (username) admin.username = username;
		if (email) admin.email = email;
		if (role) admin.role = role;
		if (password) {
			admin.password = password;
		}
		await admin.save();
		const safe = admin.toObject();
		delete (safe as any).password;
		return res.status(200).json({ admin: safe });
	} catch (err: any) {
		console.error("Error in updateAdmin:", err);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteAdmin = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const admin = await Admin.findByIdAndDelete(id);
		if (!admin) {
			return res.status(404).json({ message: "Admin not found" });
		}
		return res.status(200).json({ message: "Admin deleted" });
	} catch (err: any) {
		console.error("Error in deleteAdmin:", err);
		return res.status(500).json({ message: "Internal server error" });
	}
};
