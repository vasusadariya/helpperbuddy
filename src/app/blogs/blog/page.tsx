"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Fetch ID from URL query
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

type Blog = {
  id: string;
  title: string;
  content: string;
  image?: string;
  author: string;
  readTime: number;
  createdAt: string;
};

export default function BlogPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Fetch ID from query parameter
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return notFound();

    const fetchBlog = async () => {
      const res = await fetch(`/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }), // Send ID in body
      });

      if (!res.ok) return notFound();
      const data = await res.json();
      setBlog(data);
      setLoading(false);
    };

    fetchBlog();
  }, [id]);

  if (loading) return <p className="text-center text-white text-lg">Loading...</p>;
  if (!blog) return notFound();

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      {/* Main Content Section */}
      <div className="max-w-4xl mx-auto px-6 pt-32 md:pt-40">
        <Card className="bg-gray-900 text-white shadow-lg rounded-xl p-6">
          {/* Blog Image */}
          {blog.image && (
            <div className="relative w-full h-96 mb-6">
              <Image
                src={blog.image}
                alt={blog.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Blog Header */}
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold leading-tight">{blog.title}</CardTitle>
            <p className="text-md text-gray-400 mt-2">
              By <span className="font-semibold">{blog.author}</span> • {blog.readTime} min read
            </p>
          </CardHeader>

          {/* Blog Content */}
          <CardContent className="prose prose-invert max-w-none text-lg leading-relaxed mt-6">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
