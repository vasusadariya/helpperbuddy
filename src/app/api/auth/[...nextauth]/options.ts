import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SIGNUP_BONUS = 100; // ₹100 signup bonus

// Helper function to ensure wallet exists
async function ensureWalletExists(userId: string) {
    const existingWallet = await prisma.wallet.findUnique({
        where: { userId }
    });

    if (!existingWallet) {
        // Create wallet with signup bonus
        await prisma.wallet.create({
            data: {
                userId,
                balance: SIGNUP_BONUS,
                transactions: {
                    create: {
                        amount: SIGNUP_BONUS,
                        type: 'SIGNUP_BONUS',
                        description: 'Welcome bonus',
                        userId
                    }
                }
            }
        });
    }
}


export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required.");
                }

                // Check if user exists
                const user = await prisma.user.findUnique({ where: { email: credentials.email } });

                // Check if partner exists
                const partner = await prisma.partner.findUnique({ where: { email: credentials.email } });

                if (user) {
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) throw new Error("Invalid credentials");

                    return { id: user.id, email: user.email, name: user.name, role: "USER" };
                }

                if (partner) {
                    if (!partner.approved) throw new Error("Your account is pending admin approval.");

                    const isValid = await bcrypt.compare(credentials.password, partner.password);
                    if (!isValid) throw new Error("Invalid credentials");

                    return { id: partner.id, email: partner.email, name: partner.name ,role: "PARTNER" };
                }

                throw new Error("No account found.");
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            async profile(profile) {
                let user = await prisma.user.findUnique({ where: { email: profile.email } });
                let partner = await prisma.partner.findUnique({ where: { email: profile.email } });

                if (user) {
                    await ensureWalletExists(user.id);
                    return { id: user.id, email: user.email, role: "USER" } as any;
                }

                if (partner && partner.approved) {
                    return { id: partner.id, email: partner.email, role: "PARTNER" } as any;
                }

                throw new Error("No account found.");
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: any; token: any }) {
            session.user.role = token.role;
            return session;
        },
        async jwt({ token, user }: { token: any; user?: any }) {
            if (user) token.role = user.role;
            return token;
        },
        async signIn({ user }: { user: any }) {
            try {
                if (user.role === "USER") {
                    // Ensure wallet exists when user signs in
                    await ensureWalletExists(user.id);
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return true; // Still allow sign in even if wallet creation fails
            }
        },
        async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            return baseUrl;
        },
    },
    pages: {
        signIn: "/signin",
    },
};

export const handler = NextAuth(authOptions);   