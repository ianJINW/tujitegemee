import { compare, genSalt, hash } from "bcrypt";
import { model, Schema } from "mongoose";

interface Admins {
	email: string;
	username: string;
	password: string;
	role: string;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			required: true,
			enum: ["admin", "user"],
			default: "user",
		},
	},
	{
		timestamps: true,
	}
);

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  console.log("Comparing passwords...");
	console.log("Stored hash:", this.password);
	console.log("Candidate password:", candidatePassword);
	const result = await compare(candidatePassword, this.password);
	console.log("Comparison result:", result);
	return result;
}

const Admin = model<Admins>('Admin', AdminSchema)
export default Admin

/* model Admin {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  username      String?
  password        String
  posts     Story[]    // assuming you also have a Post model
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
*/