'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useEdgeStore } from '@/lib/edgestore';
import { SingleImageDropzone } from '@/components/SingleImageDropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddService() {
    const params = useSearchParams();
    const [name, setName] = useState(params.get('name') || '');
    const [description, setDescription] = useState(params.get('description') || '');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const { edgestore } = useEdgeStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async () => {
        setUploading(true)
        if (!name || !description || !category || !price || !file)
            return alert('Please fill all required fields');

        let imageUrl = '';
        if (file) {
            setUploading(true);
            const res = await edgestore.publicFiles.upload({
                file,
                options: {
                    temporary: true,
                }
            });
            imageUrl = res.url;
            setUploading(false);
        }

        const res = await fetch('/api/admin/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, price, image: imageUrl, category }),
        });

        if (res.ok) {
            edgestore.publicFiles.confirmUpload({ url: imageUrl });
            setName('');
            setDescription('');
            setPrice(0);
            setCategory('');
            setFile(null);

            if (params.get('from') === 'partner') {
                const confirmComplete = confirm('Mark the original PartnerRequestedService as COMPLETED?');

                if (confirmComplete) {
                    await fetch(`/api/admin/partner-requested-services/${params.get('id')}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'COMPLETED' }),
                    });
                }
            }
            setUploading(false);
        } else {
            alert('Failed to create service');
            setUploading(false);
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Service</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Service Name"
                        className="w-full p-3 border border-gray-300 rounded-md mb-4"
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Service Description"
                        className="w-full p-3 border border-gray-300 rounded-md mb-4"
                    />

                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="Service Price"
                        className="w-full p-3 border border-gray-300 rounded-md mb-4"
                    />

                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded">
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <div className="mb-4">
                        <SingleImageDropzone
                            width={200}
                            height={200}
                            value={file}
                            onChange={(file) => setFile(file ?? null)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition disabled:bg-gray-300"
                    >
                        {uploading ? 'Uploading...' : 'Submit Service'}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}