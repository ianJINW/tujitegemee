import { Document } from "mongoose";
export interface IAdmin {
    email: string;
    username: string;
    password: string;
    role: "admin" | "user";
}
export interface AdminDocument extends Document, IAdmin {
    comparePassword(candidate: string): Promise<boolean>;
}
declare const Admin: import("mongoose").Model<AdminDocument, {}, {}, {}, Document<unknown, {}, AdminDocument, {}, {}> & AdminDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Admin;
