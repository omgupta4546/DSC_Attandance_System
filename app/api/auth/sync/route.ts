import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Students from "@/models/Students";
import { generateToken } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return NextResponse.redirect(new URL("/login?error=NoSession", request.url));
    }

    try {
        await connectToDatabase();
        const email = session.user.email;

        let user = await User.findOne({ email });
        if (!user) {
            user = await Students.findOne({ email });
        }

        if (!user) {
            // Should not happen if signIn callback works correctly
            return NextResponse.redirect(new URL("/login?error=UserNotFound", request.url));
        }

        // Generate Token
        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role || 'user'
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

        // Redirect to Dashboard
        if (user.role === 'admin' || user.role === 'member') {
            return NextResponse.redirect(new URL("/admin/scanner", request.url));
        } else {
            return NextResponse.redirect(new URL(`/student-dashboard?userId=${user._id}`, request.url));
        }

    } catch (error) {
        console.error("Sync Error:", error);
        return NextResponse.redirect(new URL("/login?error=SyncFailed", request.url));
    }
}
