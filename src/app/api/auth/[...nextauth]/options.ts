import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import { Session as NextAuthSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SIGNUP_BONUS = 100; // ₹100 signup bonus

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
        role?: string | null;
    } & NextAuthSession["user"];
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
                                // Ensure wallet exists for regular users
            if (role === "USER") {
                await ensureWalletExists(user.id);
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
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            authorization: {
                params: {
                    prompt: "select_account"
                }
            },
            async profile(profile): Promise<User> {
                try {
                    const user = await prisma.user.findUnique({ where: { email: profile.email } });
                    const partner = await prisma.partner.findUnique({ where: { email: profile.email } });
                    const isAdminPattern = /^hbadmin[\w\d]+@gmail\.com$/.test(profile.email);

                    // If existing user found
                    if (user) {
                        let role = user.role.toString();
                        if (isAdminPattern && role !== "ADMIN") {
                            role = "PENDING_ADMIN";
                        }
                        await ensureWalletExists(user.id);
                        return { id: user.id, email: user.email, name: user.name, role };
                    }

                    // If approved partner found
                    if (partner && !partner.approved) {
                        alert("Your account is pending admin approval.");
                        return { id: partner.id, email: partner.email, name: partner.name, role: "PARTNER" };
                    }

                    if(partner && partner.approved) {
                        return { id: partner.id, email: partner.email, name: partner.name, role: "PARTNER" };
                    }

                    // For new users
                    return { 
                        id: profile.sub,
                        email: profile.email,
                        name: profile.name,
                        role: "NEW_USER" // Special role for new users
                    };
                } catch (error) {
                    console.error("Error in Google profile callback:", error);
                    throw error;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (!session.user) {
                session.user = { name: null, email: null, image: null, role: token.role as string } as Session["user"];
            } else {
                (session.user as Session["user"]).role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as User).role;
            }
            return token;
        },
        async signIn({ user, account }) {
            try {
                if (account?.provider === "google") {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    if (existingUser) {
                        // Ensure wallet exists for existing users
                        if (existingUser.role === "USER") {
                            await ensureWalletExists(existingUser.id);
                        }
                        return true;
                    } else {
                        // Store temporary data in session and redirect to signup
                        return `/signup?email=${user.email}&name=${user.name}`;
                    }
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
        async redirect({ url, baseUrl }) {
            try {
                // Handle signup redirect
                if (url.startsWith('/signup')) {
                    return `${baseUrl}${url}`;
                }

                // Get user role from session
                const email = new URL(url).searchParams.get('email');
                if (email) {
                    const user = await prisma.user.findUnique({ where: { email } });
                    const partner = await prisma.partner.findUnique({ where: { email } });

                    // Redirect based on role
                    if (user?.role === 'ADMIN') return `${baseUrl}/admin/dashboard`;
                    if (user?.role === 'USER') return `${baseUrl}/dashboard`;
                    if (partner?.approved) return `${baseUrl}/partner/dashboard`;
                    if (!user && !partner) return `${baseUrl}/signup`;
                }

                return url.startsWith('/') ? `${baseUrl}${url}` : baseUrl;
            } catch (error) {
                console.error("Error in redirect callback:", error);
                return baseUrl;
            }
        }
    },
    pages: {
        signIn: "/signin",
        error: "/auth/error",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);