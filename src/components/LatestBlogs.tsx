import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { prisma } from "@/lib/prisma"
import { unstable_cache } from 'next/cache'

// Cache the blog fetching function
const getLatestBlogs = unstable_cache(
  async () => {
    const blogs = await prisma.blog.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        image: true,
        readTime: true,
        createdAt: true,
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    })
    return blogs
  },
  ['latest-blogs'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['blogs']
  }
)

export default async function LatestBlogs() {
  const blogs = await getLatestBlogs()
  const [featuredBlog, ...otherBlogs] = blogs

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-2">
            <div className="text-sm font-medium uppercase tracking-wider">BLOGS</div>
            <h2 className="text-4xl font-bold">Latest Articles</h2>
          </div>
          <Link 
            href="/blogs" 
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80 hover:underline transition-opacity"
          >
            VIEW ALL
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Blog */}
          {featuredBlog && (
            <Link href={`/blogs/${featuredBlog.id}`} className="relative group">
              <div className="relative h-[600px] overflow-hidden rounded-2xl">
                <Image
                  src={featuredBlog.image || '/placeholder-blog.jpg'}
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  width={1200}
                  height={600}
                  priority={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 p-8 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm">By {featuredBlog.author}</span>
                    <span className="w-1 h-1 bg-white rounded-full" />
                    <span className="text-sm">{featuredBlog.readTime} min read</span>
                    <span className="w-1 h-1 bg-white rounded-full" />
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(featuredBlog.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold leading-tight mb-4">
                    {featuredBlog.title}
                  </h3>
                </div>
              </div>
            </Link>
          )}

          {/* Other Blogs */}
          <div className="flex flex-col justify-between h-[600px]">
            {otherBlogs.map((blog) => (
              <Link 
                key={blog.id} 
                href={`/blogs/${blog.id}`} 
                className="flex gap-6 group hover:bg-white rounded-xl p-3 transition-colors"
              >
                <div className="w-1/3 h-[120px] overflow-hidden rounded-xl flex-shrink-0">
                  <Image
                    src={blog.image || '/placeholder-blog.jpg'}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="w-2/3 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">By {blog.author}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <span className="text-sm">{blog.readTime} min read</span>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">
                    {blog.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}