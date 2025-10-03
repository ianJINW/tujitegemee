import { Router } from "express";
import {
	createAdmin,
	deleteAdmin,
	getAdminById,
	getAdmins,
	updateAdmin,
} from "../controllers/admin.ts";

const adminRouter = Router();

adminRouter.route("/admins").get(getAdmins).post(createAdmin);

adminRouter
	.route("/admins/:id")
	.get(getAdminById)
	.put(updateAdmin)
	.delete(deleteAdmin);

export default adminRouter;
