import type { Request, Response, NextFunction } from "express";
import { type JwtPayload } from "jsonwebtoken";
export interface AdminJwtPayload extends JwtPayload {
    adminId: string;
    email: string;
    role?: string;
}
export declare const authToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=jwt.d.ts.map