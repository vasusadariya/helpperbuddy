import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.pathname.split('/').pop(); // Get the email from the URL

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: decodeURIComponent(email) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneno: true,
        createdAt: true,
        referralCode: true,
        wallet: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Received request at /api/users");

    if (!request.body) {
      console.log("Request body is null or undefined");
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    if (!body || typeof body !== "object") {
      console.log("Invalid JSON format");
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const { name, email, phoneno, password, referralCode } = body;

    if (!name || !email || !phoneno || !password) {
      console.log("Validation failed - Missing fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const isAdminPattern = /^hbadmin[\w\d]+@gmail\.com$/.test(email);
    const assignedRole = isAdminPattern ? "PENDING_ADMIN" : "USER";

    const hashedPassword = await hash(password, 10);
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const SIGNUP_BONUS = 100; // Define signup bonus amount

    // Find referrer if referral code is provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode }
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    try {
      // Create user with transaction to handle both user and wallet creation
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            name,
            email,
            phoneno,
            password: hashedPassword,
            role: assignedRole,
            referralCode: newReferralCode,
            referredBy: referrerId
          },
        });

        // Create wallet for the new user with signup bonus
        const wallet = await tx.wallet.create({
          data: {
            userId: user.id,
            balance: SIGNUP_BONUS
          }
        });

        // Create transaction record for signup bonus
        await tx.transaction.create({
          data: {
            amount: SIGNUP_BONUS,
            type: 'CREDIT',
            description: 'Signup bonus',
            walletId: wallet.id,
            userId: user.id
          }
        });

        return { user, wallet };
      });

      console.log("User created successfully:", result);
      return NextResponse.json(
        { 
          id: result.user.id, 
          email: result.user.email, 
          phoneno: result.user.phoneno, 
          role: result.user.role,
          referralCode: result.user.referralCode,
          wallet: {
            balance: result.wallet.balance
          }
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        if ((error as any).code === 'P2002') {
          const field = (error as any).meta?.target?.[0];
          return NextResponse.json(
            { error: `${field} already exists` },
            { status: 409 }
          );
        }
        console.error("Prisma Error in /api/user:", error);
      } else {
        console.error("Unknown error in /api/user:", error);
      }
    
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }    
  } catch (error) {
    console.error("Error in /api/user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
