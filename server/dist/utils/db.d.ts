import mongoose from "mongoose";
declare const connectDB: (mongoURI: string) => Promise<typeof mongoose>;
export default connectDB;
