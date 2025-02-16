'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

export function SingleImageDropzone({ width, height, value, onChange }: 
    { width: number; height: number; value?: File | string | null; onChange?: (file?: File | null) => void; }) {
  
    const imageUrl = React.useMemo(() => (typeof value === 'string' ? value : value ? URL.createObjectURL(value) : null), [value]);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        multiple: false,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length) onChange?.(acceptedFiles[0]);
        },
    });

    return (
        <div {...getRootProps()} className="p-4 border rounded-lg cursor-pointer text-center">
            <input {...getInputProps()} />
            {imageUrl ? <Image src={imageUrl} alt="Preview" className="mx-auto" width={width} height={height} /> : <p>Drag & drop or click to upload</p>}
        </div>
    );
}
