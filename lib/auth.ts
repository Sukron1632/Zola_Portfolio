import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const adminEmail = process.env.ADMIN_EMAIL;
      // Strictly restrict login to the admin email specified in environment variables
      if (!adminEmail || !user.email) {
        return false;
      }
      const isAllowed = user.email.toLowerCase() === adminEmail.toLowerCase();
      if (isAllowed) {
        // Automatically sync admin record into PostgreSQL database
        try {
          await prisma.user.upsert({
            where: { email: user.email.toLowerCase() },
            update: {
              name: user.name,
              image: user.image,
            },
            create: {
              email: user.email.toLowerCase(),
              name: user.name,
              image: user.image,
              role: "ADMIN",
            },
          });
        } catch (err) {
          console.error("Failed to sync user into database:", err);
        }
        return true;
      }
      return false;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.sub;
        (session.user as { id?: string; role?: string }).role = "ADMIN";
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
