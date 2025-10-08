import { Router } from "express";
import multer from "multer";
import {
	createAdmin,
	deleteAdmin,
	getAdminById,
	getAdmins,
	login,
	logout,
	updateAdmin,
} from "../controllers/admin.ts";

const adminRouter = Router();

adminRouter.route("/").get(getAdmins).post(createAdmin);

adminRouter
	.route("/admins/:id")
	.get(getAdminById)
	.put(updateAdmin)
	.delete(deleteAdmin);

adminRouter.post("/login", login);
adminRouter.post("/logout", logout);

export default adminRouter;
