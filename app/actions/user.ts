'use server';

import User from '@/models/User';
import Students from '@/models/Students';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { generateToken } from '@/lib/auth';
import { sendMail } from '@/lib/email';
import { registrationTemplate } from '@/mail/studentRegistration';

// 1. Register User
export async function getSession() {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return null;

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) return null;

    return {
      userId: decoded.id,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

export async function registerUser(userData: any) {
  console.log('registerUser received:', JSON.stringify(userData, null, 2));
  try {
    await connectToDatabase();

    if (!userData.email || !userData.name || !userData.password || !userData.rollNumber) {
      console.error('Validation failed: Missing required fields');
      return { success: false, error: 'Missing required fields (Name, Email, Password, Roll Number)' };
    }

    // Check if user exists (email or roll number)
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { rollNumber: userData.rollNumber }]
    });

    if (existingUser) {
      return { success: false, error: 'User with this email or roll number already exists.' };
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generate QR Code URL (Unique per user)
    // We can use the MongoDB _id after creation, or generate a random string.
    // Existing logic used random string. Let's stick to that or use _id.
    // For consistency with legacy `registerStudents`, let's generate a random ID for QR.
    const qrId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://student-dashboard-sable.vercel.app'}/scan/${qrId}`;

    const newUser = new User({
      ...userData,
      password: hashedPassword,
      role: 'user', // Default role
      qrCode: qrCodeUrl,
      attendance: [],
      // Ensure other fields are mapped if needed
    });

    await newUser.save();

    // Auto-login after registration?
    // We can just return success and let frontend redirect to login.
    // Or return a token.
    // Let's return success.

    return { success: true, userId: newUser._id.toString() };

  } catch (error) {
    console.error('Registration Error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

// 2. Unified Login
export async function loginUser(formData: any) {
  console.log('loginUser received:', JSON.stringify(formData, null, 2));
  try {
    await connectToDatabase();
    const { email, password } = formData;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return { success: false, error: 'Invalid credentials' };

    if (!user.password) {
      return { success: false, error: 'Please contact admin to set your password.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { success: false, error: 'Invalid credentials' };

    // Generate Token with Role
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Set Cookie
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return { success: true, role: user.role, userId: user._id.toString() };

  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();
    let user = await User.findById(userId);

    if (!user) {
      user = await Students.findById(userId);
    }

    if (!user) return { success: false, error: 'User not found' };

    // Return plain object
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    return { success: false, error: 'Failed to fetch user' };
  }
}

// Legacy Aliases / Hybrid Functions

export async function getStudentById(userId: string) {
  return getUserById(userId);
}

export async function getStudentByEmail(email: string) {
  try {
    await connectToDatabase();
    let user = await User.findOne({ email });

    if (!user) {
      user = await Students.findOne({ email });
    }

    if (!user) return { success: false, error: 'User not found' };

    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    return { success: false, error: 'Failed to fetch user' };
  }
}

export async function getAllUsers() {
  try {
    await connectToDatabase();
    const users = await User.find({}).sort({ name: 1 });
    return { success: true, users: JSON.parse(JSON.stringify(users)) };
  } catch (error) {
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function getUserByRollNumber(rollNumber: string) {
  try {
    await connectToDatabase();
    let user = await User.findOne({ rollNumber });

    if (!user) {
      user = await Students.findOne({ rollNumber });
    }

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        qrCode: user.qrCode,
        attendance: user.attendance.map((a: any) => ({
          date: a.date.toISOString(),
          present: a.present
        })),
        // Include other fields if needed by dashboard
        universityRollNo: user.universityRollNo,
        branch: user.branch,
        year: user.year,
        // ...
      }
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

// --- Admin/Attendance Actions ---

const indiaTimeZone = "Asia/Kolkata";

export async function markAttendance(qrCodeId: string) {
  try {
    await connectToDatabase();

    // Authorization Check
    const token = cookies().get('auth-token')?.value;
    if (!token) return { success: false, error: 'Unauthorized' };

    const decoded: any = jwt.decode(token);
    if (decoded?.role !== 'admin' && decoded?.role !== 'member') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Find user by QR Code URL part
    const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://student-dashboard-sable.vercel.app'}/scan/${qrCodeId}`;

    let user: any = await User.findOne({ qrCode: fullUrl });

    if (!user) {
      user = await Students.findOne({ qrCode: fullUrl });
    }

    if (!user) return { success: false, error: 'User not found' };

    // Check Today's Attendance
    const todayIST = format(toZonedTime(new Date(), indiaTimeZone), 'yyyy-MM-dd');
    const hasAttendance = user.attendance.find((a: any) => {
      const dateIST = format(toZonedTime(new Date(a.date), indiaTimeZone), 'yyyy-MM-dd');
      return dateIST === todayIST;
    });

    if (hasAttendance) return { success: true, message: 'Already marked for today', user: JSON.parse(JSON.stringify(user)) };

    // Mark
    user.attendance.push({ date: new Date(), present: true });
    await user.save();

    revalidatePath('/dashboard');
    return { success: true, message: 'Attendance marked', user: JSON.parse(JSON.stringify(user)) };

  } catch (error) {
    console.error('Attendance Error:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function logout() {
  cookies().delete('auth-token');
  return { success: true };
}

// Legacy Aliases for Backward Compatibility

export async function registerStudents(studentData: any) {
  try {
    await connectToDatabase();
    // Check existing
    const existingUser = await User.findOne({
      $or: [{ email: studentData.email }, { rollNumber: studentData.rollNumber }]
    });

    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    // Generate QR
    const userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://student-dashboard-sable.vercel.app'}/scan/${userId}`;

    // Create User (Legacy registration implies 'user' role)
    const hashedPassword = await bcrypt.hash('welcome123', 10); // Default password for legacy registration

    const newUser = new User({
      ...studentData,
      password: hashedPassword,
      role: 'user',
      qrCode: qrCodeUrl,
      attendance: []
    });

    await newUser.save();

    // Send Email
    const html = registrationTemplate(studentData.name, studentData.rollNumber, studentData.eventName || 'DSC Membership', qrCodeUrl, studentData.email);
    await sendMail({ to: studentData.email, subject: 'Welcome to DSC RTU Kota', html });

    return { success: true, userId: newUser._id.toString() };
  } catch (error) {
    console.error('Registration Error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function adminLogin(username: string, password: string) {
  return loginUser({ email: username, password });
}


// --- Recruitment / Review Actions (Restored) ---

export const getAllRecruitments = async () => {
  try {
    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 });
    const students = await Students.find({}).sort({ createdAt: -1 });

    const allRecords = [...users, ...students];
    const seen = new Set();
    const uniqueRecords = allRecords.filter(r => {
      if (seen.has(r.email)) return false;
      seen.add(r.email);
      return true;
    });

    return {
      success: true,
      students: uniqueRecords.map((user: any) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        branch: user.branch,
        universityRollNo: user.universityRollNo,
        year: user.year,
        eventName: user.eventName,
        phoneNumber: user.phoneNumber,
        qrCode: user.qrCode,
        attendance: user.attendance.map((a: any) => ({
          date: a.date.toISOString(),
          present: a.present
        })),
        cgpa: user.cgpa,
        back: user.back,
        summary: user.summary,
        clubs: user.clubs,
        aim: user.aim,
        believe: user.believe,
        expect: user.expect,
        domain: user.domain,
        review: user.review ?? null,
        comment: user.comment ?? "",
        roundOneAttendance: user.roundOneAttendance,
        roundTwoAttendance: user.roundTwoAttendance,
        roundOneQualified: user.roundOneQualified,
        roundTwoQualified: user.roundTwoQualified,
      }))
    };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Failed to fetch students" };
  }
};

interface ReviewData {
  studentId: string;
  review?: number;
  comment?: string;
  roundOneAttendance?: boolean;
  roundTwoAttendance?: boolean;
  roundOneQualified?: boolean;
  roundTwoQualified?: boolean;
}

export const review = async (data: ReviewData) => {
  try {
    await connectToDatabase();
    // Try to update User first
    let student = await User.findByIdAndUpdate(data.studentId, {
      review: data.review ?? null,
      comment: data.comment ?? "",

      roundOneAttendance: data.roundOneAttendance,
      roundTwoAttendance: data.roundTwoAttendance,
      roundOneQualified: data.roundOneQualified,
      roundTwoQualified: data.roundTwoQualified,

    }, { new: true });

    if (!student) {
      // Try Students
      student = await Students.findByIdAndUpdate(data.studentId, {
        review: data.review ?? null,
        comment: data.comment ?? "",

        roundOneAttendance: data.roundOneAttendance,
        roundTwoAttendance: data.roundTwoAttendance,
        roundOneQualified: data.roundOneQualified,
        roundTwoQualified: data.roundTwoQualified,

      }, { new: true });
    }

    if (!student) {
      return { success: false, error: "student not found" }
    }

    return { success: true, students: student }
  } catch (error) {
    console.error("Error reviewing student:", error);
    return { success: false, error: "Failed to review student" };
  }
}
