import { Schema } from "mongoose";
declare const Story: import("mongoose").Model<{
    media: any[];
    title: string;
    content: string;
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    media: any[];
    title: string;
    content: string;
}, {}, import("mongoose").DefaultSchemaOptions> & {
    media: any[];
    title: string;
    content: string;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    media: any[];
    title: string;
    content: string;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    media: any[];
    title: string;
    content: string;
}>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
    media: any[];
    title: string;
    content: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>>;
export default Story;
