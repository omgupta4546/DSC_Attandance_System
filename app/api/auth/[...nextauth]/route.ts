import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
// import Students from "@/models/Students"; // Legacy support if needed

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("DEBUG: signIn callback triggered");
            console.log("DEBUG: User email:", user.email);
            if (!user.email) return false;

            try {
                console.log("DEBUG: Connecting to DB...");
                await connectToDatabase();
                console.log("DEBUG: DB Connected");

                // Check if user exists in User collection
                const existingUser = await User.findOne({ email: user.email });
                if (existingUser) return true;

                // Check legacy Students collection if you have it, else remove this block
                // const existingStudent = await Students.findOne({ email: user.email });
                // if (existingStudent) return true;

                // If not found, return false (deny sign in)
                return false;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
        async session({ session, token }) {
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
