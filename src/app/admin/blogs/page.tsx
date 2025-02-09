'use client';

import { useState, useEffect } from 'react';
import { SingleImageDropzone } from '@/components/SingleImageDropzone';
import { useEdgeStore } from '@/lib/edgestore';
// import { serverSideDelete } from '@/lib/edgestore-action';

interface Blog {
    id: string;
    title: string;
    content: string;
    image?: string;
    author: string;
    readTime: number;
    createdAt: string;
}

export default function AdminBlogManager() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [readTime, setReadTime] = useState<number>(5);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const { edgestore } = useEdgeStore();

    // Fetch Blogs
    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        const res = await fetch('/api/admin/blogs');
        const data = await res.json();
        setBlogs(data);
    };

    // Create Blog
    const handleCreateBlog = async () => {
        if (!title || !content || !author || !file) return alert('Please fill all required fields');

        let imageUrl = '';
        if (file) {
            setUploading(true);
            const res = await edgestore.publicFiles.upload({ file });
            imageUrl = res.url;
            setUploading(false);
        }

        const res = await fetch('/api/admin/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, image: imageUrl, author, readTime }),
        });

        if (res.ok) {
            fetchBlogs();
            setTitle('');
            setContent('');
            setAuthor('');
            setReadTime(5);
            setFile(null);
        } else {
            alert('Failed to create blog');
        }
    };

    // Delete Blog
    const handleDeleteBlog = async (id: string, image: string | undefined) => {
        if (!confirm('Are you sure?')) return;
        
        try {
            await fetch('/api/edgestore/delete', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: image }),
            });
            console.log('Image deleted successfully');
          } catch (error) {
            console.error('Error deleting image:', error);
          }

        const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setBlogs((prev) => prev.filter((blog) => blog.id !== id));
        } else {
            alert('Failed to delete blog');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Admin - Manage Blogs</h1>

            {/* Create Blog Form */}
            <div className="space-y-4">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title" className="w-full p-2 border rounded" />
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Content" className="w-full p-2 border rounded"></textarea>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author" className="w-full p-2 border rounded" />
                <input type="number" value={readTime} onChange={(e) => setReadTime(Number(e.target.value))}
                    placeholder="Read Time (min)" className="w-full p-2 border rounded" />

                <SingleImageDropzone 
                width={200} 
                height={200} 
                value={file} 
                onChange={(file) => setFile(file ?? null)} 
                />

                <button onClick={handleCreateBlog} disabled={uploading} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                    {uploading ? 'Uploading...' : 'Create Blog'}
                </button>
            </div>

            {/* Blog List */}
            <h2 className="text-xl font-bold mt-6 mb-2">Existing Blogs</h2>
            <ul className="space-y-4">
                {blogs.map((blog) => (
                    <li key={blog.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{blog.title}</h3>
                            <p className="text-gray-600 text-sm">{blog.author} - {blog.readTime} min read</p>
                        </div>
                        <button onClick={() => handleDeleteBlog(blog.id, blog.image)}
                            className="bg-red-500 text-white px-3 py-1 rounded">
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
