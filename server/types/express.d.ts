import type { AdminJwtPayload } from "../middleware/jwt.ts";

declare global {
	namespace Express {
		interface Request {
			admin?: AdminJwtPayload;
		}
	}
}
