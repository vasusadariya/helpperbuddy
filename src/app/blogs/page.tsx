"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";

type Blog = {
  id: string;
  title: string;
  content: string;
  image?: string;
  author: string;
  readTime: number;
  createdAt: string;
};

export default function BlogsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      const res = await fetch(`/api/blogs?page=${page}`);
      const data = await res.json();
      setBlogs(data.data);
      setTotalPages(data.metadata.totalPages);
      setLoading(false);
    };
    fetchBlogs();
  }, [page]);

  const goToPage = (newPage: number) => {
    router.push(`/blogs?page=${newPage}`);
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 mt-20 text-center text-white">Latest Blogs</h1>

      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {blogs.map((blog) => (
            <Link href={`/blogs/${blog.id}`} key={blog.id} className="block">
              <Card className="overflow-hidden shadow-lg cursor-pointer">
                {blog.image && (
                  <div className="relative w-full h-64">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <CardTitle className="text-xl font-semibold">{blog.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">By {blog.author} • {blog.readTime} min read</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6 flex justify-center mb-6">
          <PaginationContent className="flex items-center gap-4">
            <PaginationItem>
              <Button disabled={page === 1} onClick={() => goToPage(page - 1)}>
                <PaginationPrevious />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-white">Page {page} of {totalPages}</span>
            </PaginationItem>
            <PaginationItem>
              <Button disabled={page === totalPages} onClick={() => goToPage(page + 1)}>
                <PaginationNext />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Footer />
    </div>
  );
}
