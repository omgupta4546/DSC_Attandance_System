import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional for now if we support google auth later, but required for manual
  rollNumber: string;
  universityRollNo?: string;
  branch?: string;
  year?: string;
  phoneNumber?: string;
  eventName?: string; // Kept for legacy compatibility or specific event reg

  // Developer Profile Fields
  githubProfile?: string;
  linkedinProfile?: string;
  portfolio?: string;
  skills?: string[];

  role: 'user' | 'member' | 'admin';

  qrCode?: string;
  attendance: {
    date: Date;
    present: boolean;
  }[];

  // Additional fields from Students.ts (optional/legacy support)
  review?: number | null;
  comment?: string;
  roundOneAttendance?: boolean;
  roundTwoAttendance?: boolean;
  roundOneQualified?: boolean;
  roundTwoQualified?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, trim: true, lowercase: true },
    password: { type: String, select: false }, // Should be required for new auth
    rollNumber: { type: String, required: [true, 'Please provide a roll number'], unique: true, trim: true },
    universityRollNo: { type: String, trim: true },
    branch: { type: String, trim: true },
    year: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    eventName: { type: String, trim: true },

    role: { type: String, enum: ['user', 'member', 'admin'], default: 'user' },

    // Developer Profile
    githubProfile: { type: String, trim: true },
    linkedinProfile: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    skills: { type: [String], default: [] },

    qrCode: { type: String, unique: true },

    attendance: [{
      date: { type: Date, required: true },
      present: { type: Boolean, default: true },
    }],

    // Logic for rounds/reviews
    review: { type: Number, default: null },
    comment: { type: String, default: "" },
    roundOneAttendance: { type: Boolean, default: false },
    roundTwoAttendance: { type: Boolean, default: false },
    roundOneQualified: { type: Boolean, default: false },
    roundTwoQualified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);