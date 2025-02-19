// src/app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, rating, description } = await req.json();

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify order belongs to user and is completed
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user: {
          email: session.user.email
        },
        status: "COMPLETED"
      },
      include: {
        review: true // Include to check if review exists
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not eligible for review" },
        { status: 404 }
      );
    }

    // Check if review already exists
    if (order.review) {
      return NextResponse.json({ 
        success: false,
        error: "Review already exists for this order",
      }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId,
        rating,
        description: description || ""
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ 
        error: "Order ID is required",
      }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user: {
          email: session.user.email
        }
      },
      include: {
        review: true
      }
    });

    if (!order) {
      return NextResponse.json({ 
        success: false,
        error: "Order not found"
      }, { status: 404 });
    }

    if (!order.review) {
      return NextResponse.json({ 
        success: false,
        error: "Review not found for this order",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        review: order.review
      }
    });

  } catch (error) {
    console.error("Review fetch error:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch review",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}