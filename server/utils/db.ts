import mongoose from "mongoose";

const connectDB = async (mongoURI: string) => {
	try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    return conn;
	} catch (error) {
		console.error(`Error connecting to database: ${error}`);
		process.exit(1);
	}
};

export default connectDB;