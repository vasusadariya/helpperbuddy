import { Suspense } from "react";
import { Category } from "@prisma/client";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesClient from "./ServicesClient";

// Types
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  threshold: number;
  numberoforders: number;
  category: Category;
  image?: string;
}

// Reusable search function
async function searchServices(query: string = "", category: string = "") {
  try {
    const results = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
        ...(category && category !== "all" ? { category: category as Category } : {}),
      },
      orderBy: { numberoforders: "desc" },
    });

    // Convert Decimal fields to numbers
    return results.map(service => ({
      ...service,
      threshold: service.threshold?.toNumber(),
    }));
  } catch (error) {
    console.error("Error searching services:", error);
    throw error;
  }
}

// Server Component
export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { query?: string; category?: string };
}) {
  const { query = "", category = "" } = await searchParams;

  // Fetch initial services
  const initialServices = await searchServices(query, category);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="h-5"></div>
      <div className="flex flex-1 mt-16">
        <Suspense fallback={<div>Loading...</div>}>
          <ServicesClient 
            initialServices={initialServices as Service[]} 
            initialQuery={query}
            initialCategory={category}
          />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}


export const metadata = {
  title: 'Services - Professional Cleaning Services',
  description: 'Browse our wide range of services including AC repair, plumbing, electrical work, and more.',
};

export async function generateStaticParams() {
  return Object.values(Category).map((category) => ({
    category: category.toLowerCase(),
  }));
}