// scripts/seedAdmin.ts

import * as dotenv from 'dotenv';
import { connect, disconnect } from 'mongoose';
import bcrypt from 'bcrypt';
import Admin from '../models/Admin.model.ts'; 

dotenv.config();

(async () => {
  const mongoURI = process.env.MONGO_URI as string;
  if (!mongoURI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
  }

  try {
    await connect(mongoURI);
    // Clear existing admins to start fresh
    await Admin.deleteMany({});
    console.log('Cleared existing admin records');
  } catch (connErr: any) {
    console.error('Failed to connect to MongoDB:', connErr.message);
    process.exit(1);
  }

  const adminUsername ='IanJosh' /* process.env.ADMIN_USERNAME; */
  const adminEmail = 'ianjosh@gmail.com' /* process.env.ADMIN_EMAIL */;
  const adminPassword = 'qweras12zx34' /* process.env.ADMIN_PASSWORD; */

  if (!adminUsername || !adminEmail || !adminPassword) {
    console.error(
      'ADMIN_USERNAME, ADMIN_EMAIL, or ADMIN_PASSWORD is missing in environment'
    );
    await disconnect();
    process.exit(1);
  }

  try {
    // Check if admin exists by either email or username
    const exists = await Admin.findOne({
      $or: [
        { email: adminEmail },
        { username: adminUsername }
      ]
    });

    if (exists) {
      console.log('Admin user already exists. Skipping creation.');
      await disconnect();
      return;
    }

    const admin = new Admin({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword, // Plain password - will be hashed by pre-save hook
      role: 'admin',
    });

    await admin.save();
    console.log("Admin user created:", {
			/*       id: admin._id.toString(),
			 */ username: admin.username,
			email: admin.email,
		});
  } catch (error: any) {
    console.error(`Error seeding admin: ${error.message}`);
    process.exit(1);
  } finally {
    await disconnect();
  }
})();
