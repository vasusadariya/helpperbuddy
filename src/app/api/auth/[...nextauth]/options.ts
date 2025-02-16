import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import { Session as NextAuthSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SIGNUP_BONUS = 100; // ₹100 signup bonus

// Function to ensure the user has a wallet
async function ensureWalletExists(userId: string) {
    const existingWallet = await prisma.wallet.findUnique({
        where: { userId },
    });

    if (!existingWallet) {
        await prisma.wallet.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                balance: SIGNUP_BONUS,
                transaction: {
                    create: {
                        id: crypto.randomUUID(),
                        amount: SIGNUP_BONUS,
                        type: "SIGNUP_BONUS",
                        description: "Welcome bonus",
                        userId,
                    },
                },
            },
        });
    }
}

interface User extends NextAuthUser {
    role: string;
}
interface Session extends NextAuthSession {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: string | null;
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required.");
                }

                const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                const partner = await prisma.partner.findUnique({ where: { email: credentials.email } });

                // Validate Admin Email Format
                const isAdminPattern = /^hbadmin[\w\d]+@gmail\.com$/.test(credentials.email);

                if (user) {
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) throw new Error("Invalid credentials");

                    let role = user.role.toString();

                    // If the email follows the admin pattern but is not yet approved, request approval
                    if (isAdminPattern && role !== "ADMIN") {
                        role = "PENDING_ADMIN";
                    }

                    return { id: user.id, email: user.email, name: user.name, role };
                }

                if (partner) {
                    if (!partner.approved) throw new Error("Your account is pending admin approval.");

                    const isValid = await bcrypt.compare(credentials.password, partner.password);
                    if (!isValid) throw new Error("Invalid credentials");

                    return { id: partner.id, email: partner.email, name: partner.name, role: "PARTNER" };
                }

                throw new Error("No account found.");
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            async profile(profile): Promise<User> {
                const user = await prisma.user.findUnique({ where: { email: profile.email } });
                const partner = await prisma.partner.findUnique({ where: { email: profile.email } });

                // Validate Admin Email Format
                const isAdminPattern = /^hbadmin[\w\d]+@gmail\.com$/.test(profile.email);

                if (user) {
                    let role = user.role.toString();

                    // If email follows admin pattern but is not yet approved, request approval
                    if (isAdminPattern && role !== "ADMIN") {
                        role = "PENDING_ADMIN";
                    }

                    await ensureWalletExists(user.id);
                    return { id: user.id, email: user.email, name: user.name, role };
                }

                if (partner && partner.approved) {
                    return { id: partner.id, email: partner.email, name: partner.name, role: "PARTNER" };
                }

                // If new user (not in DB), create a new user
                const newUser = await prisma.user.create({
                    data: {
                        id: crypto.randomUUID(),
                        email: profile.email,
                        name: profile.name,
                        role: "USER", // Always create as USER, handle admin status separately
                        password: "", // Set a default or random password
                        referralCode: Math.random().toString(36).substring(7),
                    },
                });

                await ensureWalletExists(newUser.id);
                return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
            },
        }),
    ],
    callbacks: {
        //@ts-ignore
        async session({ session, token }: { session: Session; token: JWT }) {
            if (!session.user) {
                session.user = { name: null, email: null, image: null, role: token.role as string };
            } else {
                session.user = { ...session.user, role: token.role as string };
            }
            return session;
        },
        async jwt({ token, user}: { token: JWT; user?: User | NextAuthUser }) {
            if (user) {
                token.role = (user as User).role;
            }
            return token;
        },
        async signIn({ user, account, profile, email, credentials }: { user: User | NextAuthUser; account: any; profile?: any; email?: any; credentials?: any }) {
            try {
                if (!user) return false; // Prevent login for new users
                if ((user as User).role === "USER") {
                    await ensureWalletExists(user.id);
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
        async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
            return url.startsWith("/") ? `${baseUrl}${url}` : baseUrl;
        },
    },
    pages: {
        signIn: "/signin",
    },
};

export const handler = NextAuth(authOptions);
