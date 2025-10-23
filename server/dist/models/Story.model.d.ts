import { Schema } from "mongoose";
declare const Story: import("mongoose").Model<{
    title: string;
    content: string;
    media: any[];
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    title: string;
    content: string;
    media: any[];
}, {}, import("mongoose").DefaultSchemaOptions> & {
    title: string;
    content: string;
    media: any[];
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    title: string;
    content: string;
    media: any[];
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    title: string;
    content: string;
    media: any[];
}>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
    title: string;
    content: string;
    media: any[];
}> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>>;
export default Story;
//# sourceMappingURL=Story.model.d.ts.map