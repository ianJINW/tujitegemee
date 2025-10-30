// src/models/Admin.model.ts
import { Schema, model, Document } from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";

export interface IAdmin {
	email: string;
	username: string;
	password: string;
	role: "admin" | "user";
}

// Extend Document with your methods
export interface AdminDocument extends Document, IAdmin {
	comparePassword(candidate: string): Promise<boolean>;
}

const AdminSchema = new Schema<AdminDocument>(
	{
		email: { type: String, required: true, unique: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true, select: false },
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
	},
	{ timestamps: true }
);

AdminSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	const salt = await genSalt(10);
	this.password = await hash(this.password, salt);
	next();
});

AdminSchema.methods.comparePassword = async function (
	candidate: string
): Promise<boolean> {
	return await compare(candidate, this.password);
};

AdminSchema.pre("findOneAndUpdate", async function (this: any, next) {
	const update = this.getUpdate();

	if (update && "password" in update) {
		const newPass = (update as any).password;

		const salt = await genSalt(10);
		const hashed = await hash(newPass, salt);
		this.setUpdate({ ...update, password: hashed });
	}
	next();
});

const Admin = model<AdminDocument>("Admin", AdminSchema);
export default Admin;
