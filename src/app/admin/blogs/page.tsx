'use client';

import { SingleImageDropzone } from '@/components/SingleImageDropzone';
import { useEdgeStore } from '@/lib/edgestore';
import { useState } from 'react';

export default function SingleImageDropzoneUsage() {
  const [file, setFile] = useState<File>();
  const { edgestore } = useEdgeStore();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  return (
    <div className="p-4 border rounded-lg shadow-md w-80 bg-white">
      <h1 className="text-xl font-bold mb-4 text-center">Upload Image</h1>

      {/* Dropzone */}
      <SingleImageDropzone
        width={200}
        height={200}
        value={file}
        onChange={(file) => {
          setFile(file);
          setUploadProgress(null); // Reset progress
        }}
      />

      {/* Upload Button */}
      <button
        onClick={async () => {
          if (file) {
            setIsUploading(true);
            setUploadProgress(null);

            const res = await edgestore.publicFiles.upload({
              file,
              onProgressChange: (progress) => {
                setUploadProgress(progress);
              },
            });

            setIsUploading(false);
            console.log('Upload complete:', res);
          }
        }}
        disabled={!file || isUploading}
        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 transition"
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {/* Progress Bar (Only After Upload) */}
      {uploadProgress === 100 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Upload Completed</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-green-500 h-full text-xs text-center text-white font-bold transition-all duration-500"
              style={{ width: '100%' }}
            >
              100%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}