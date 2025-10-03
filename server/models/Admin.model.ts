import { compare, genSalt, hash } from "bcrypt";
import { model, Schema } from "mongoose";

interface Admins{
  email: string
  name: string
  password:string
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  }
})

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return compare(candidatePassword, this.password)
}

const Admin = model<Admins>('Admin', AdminSchema)
export default Admin

/* model Admin {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  password        String
  posts     Story[]    // assuming you also have a Post model
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
*/