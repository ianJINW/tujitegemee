import type { Request, Response } from "express";
declare const sender: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const sendEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export default sender;
//# sourceMappingURL=mailer.d.ts.map