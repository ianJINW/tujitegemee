import type { Request, Response } from "express";
export declare const createAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logout: (req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const getAdmins: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdminById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
