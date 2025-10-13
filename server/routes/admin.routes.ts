import { Router } from "express";
import {
	createAdmin,
	deleteAdmin,
	getAdminById,
	getAdmins,
	login,
	logout,
	updateAdmin,
} from "../controllers/admin.ts";
import { authToken } from "../middleware/jwt.ts";

const adminRouter = Router();

adminRouter.post("/login", login);

adminRouter.get("/verify", authToken);
adminRouter.use(authToken);
adminRouter.route("/").get(getAdmins).post(createAdmin);

adminRouter
	.route("/admins/:id")
	.get(getAdminById)
	.put(updateAdmin)
	.delete(deleteAdmin);

adminRouter.post("/logout", logout);

export default adminRouter;
