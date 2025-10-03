import type { Request, Response, NextFunction } from "express";
import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";
import Admin from "../models/Admin.model.ts";

interface AdminJwtPayload extends JwtPayload {
	adminId: string;
	email: string;
}

const getJWTSecret = (): string => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET must be defined");
	}
	return secret;
};

const expiresIn = (process.env.EXPIRY_TIME ?? "1h") as "1h";

// Controller: create a new admin
const createAdmin = async (req: Request, res: Response) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({ message: "Missing required fields" });
	}

	try {
		const admin = await Admin.create({ name, email, password });
		console.log(`Admin ${admin._id} created successfully`);
		return res.status(201).json({
			admin: { id: admin._id, name: admin.name, email: admin.email },
			message: `Admin ${name} created successfully`,
		});
	} catch (error) {
		console.error("Error creating admin:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

// Controller: login admin, issue JWT
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

		const isMatch = await admin.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const payload = {
			adminId: admin._id.toString(),
			email: admin.email,
		};

		const options: SignOptions = {
			expiresIn,
		};

		const token = jwt.sign(payload, getJWTSecret(), options);

		return res.json({ token, message: "Login successful" });
	} catch (error) {
		console.error("Failed to log in:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

// Middleware: protect routes
const authenticate = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}

	jwt.verify(token, getJWTSecret(), { algorithms: ["HS256"] }, (err, decoded) => {
		if (err) {
			return res.status(401).json({ message: "Invalid or expired token" });
		}
		// decoded is JwtPayload | string
		// Cast/validate to AdminJwtPayload
		const payload = decoded as AdminJwtPayload;
		// Optionally you could check payload.adminId, etc.
		; (req as any).admin = payload;
		next();
	});
};

// Controller: logout (if you have token blacklist or invalidation logic)
const logout = async (req: Request, res: Response) => {

	return res.json({ message: "Logged out (if supported)" });
};

// Controller: get all admins
const getAdmins = async (req: Request, res: Response) => {
	try {
		const admins = await Admin.find().select("-password"); // exclude password
		res.status(200).json({ admins, message: "Admins fetched successfully" });
	} catch (error) {
		console.error("Error fetching admins:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Controller: get admin by id
const getAdminById = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const admin = await Admin.findById(id).select("-password");
		if (!admin) {
			return res.status(404).json({ error: "Admin not found" });
		}
		return res
			.status(200)
			.json({ admin, message: `Admin ${admin.name} fetched successfully` });
	} catch (error) {
		console.error("Error fetching admin:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

// Controller: update admin
const updateAdmin = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { name, email, password } = req.body;

	try {
		const updates: { name?: string; email?: string; password?: string } = {};
		if (name) updates.name = name;
		if (email) updates.email = email;
		if (password) updates.password = password;

		const admin = await Admin.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
			context: "query",
		}).select("-password");

		if (!admin) {
			return res.status(404).json({ error: "Admin not found" });
		}

		return res
			.status(200)
			.json({ admin, message: `Admin ${admin.name} updated successfully` });
	} catch (error) {
		console.error("Error updating admin:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

// Controller: delete admin
const deleteAdmin = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const admin = await Admin.findByIdAndDelete(id);
		if (!admin) {
			return res.status(404).json({ error: "Admin not found" });
		}
		return res.status(200).json({ message: "Admin deleted successfully" });
	} catch (error) {
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
