import type { Request, Response } from "express";
declare const createPartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getPartners: (req: Request, res: Response) => Promise<void>;
declare const getPartnerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const updatePartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const deletePartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export { createPartner, getPartners, getPartnerById, updatePartner, deletePartner, };
