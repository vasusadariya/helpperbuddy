import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SingleImageDropzone } from '@/components/SingleImageDropzone';
import Image from 'next/image';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData, file?: File) => void;
  initialData?: ServiceFormData;
  mode: 'add' | 'edit';
  isUploading: boolean;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  threshold: number;
  image?: string;
}

export default function ServiceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isUploading
}: ServiceModalProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>(
    initialData || {
      name: '',
      description: '',
      price: 0,
      category: '',
      threshold: 2,
    }
  );
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        setCategories(data);
        setIsLoading(false);
        
        // Set initial category if not already set
        if (!formData.category && data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0] }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen,formData.category]);

  useEffect(() => {
    if (initialData) {
        setFormData(initialData);
    }
}, [initialData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFormData(initialData || {
        name: '',
        description: '',
        price: 0,
        category: '',
        threshold: 2,
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, file || undefined);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'add' ? 'Add New Service' : 'Edit Service'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Image
            </label>
            <SingleImageDropzone 
              width={200} 
              height={200} 
              value={file} 
              onChange={(file) => setFile(file ?? null)}
            />
            {initialData?.image && !file && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Current image:</p>
                <Image 
                  src={initialData.image} 
                  alt="Current service" 
                  className="mt-1 h-32 w-32 object-cover rounded-md"
                  width={400}
                  height={200}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Threshold Hours
            </label>
            <input
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              min="1"
              step="1"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
              disabled={isUploading}
            >
              {isUploading 
                ? 'Uploading...' 
                : mode === 'add' 
                  ? 'Add Service' 
                  : 'Save Changes'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}