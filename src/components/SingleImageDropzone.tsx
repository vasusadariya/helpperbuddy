'use client';

import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';

type InputProps = {
  width: number;
  height: number;
  className?: string;
  value?: File | string;
  onChange?: (file?: File) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>;
};

const SingleImageDropzone = React.forwardRef<HTMLInputElement, InputProps>(
  ({ dropzoneOptions, width, height, value, className, disabled, onChange }, ref) => {
    const imageUrl = React.useMemo(() => {
      if (typeof value === 'string') return value;
      if (value) return URL.createObjectURL(value);
      return null;
    }, [value]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
      accept: { 'image/*': [] },
      multiple: false,
      disabled,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) void onChange?.(file);
      },
      ...dropzoneOptions,
    });

    return (
      <div>
        <div
          {...getRootProps({
            className: `relative flex flex-col items-center justify-center border border-dashed rounded-md cursor-pointer transition-all duration-200 ${
              disabled ? 'bg-gray-200 cursor-not-allowed' : 'hover:border-blue-500'
            } ${isDragActive ? 'border-blue-500 bg-blue-100' : 'border-gray-400'} ${className}`,
            style: { width, height },
          })}
        >
          <input ref={ref} {...getInputProps()} />
          {imageUrl ? (
            <img className="h-full w-full rounded-md object-cover" src={imageUrl} alt="Uploaded" />
          ) : (
            <div className="text-gray-500 text-sm flex flex-col items-center">
              <svg
                className="w-8 h-8 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V12M12 16V8M17 16V4M5 20h14M5 20l4-4m10 4l-4-4"
                />
              </svg>
              <span>Drag & drop or click to upload</span>
            </div>
          )}

          {/* Remove Image Button */}
          {imageUrl && !disabled && (
            <button
              className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                void onChange?.(undefined);
              }}
            >
              <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 9l3-3a1 1 0 011.414 1.414L11.414 10l3 3a1 1 0 11-1.414 1.414l-3-3-3 3a1 1 0 01-1.414-1.414l3-3-3-3A1 1 0 016.586 6l3 3z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Error Message */}
        {fileRejections.length > 0 && (
          <p className="mt-1 text-sm text-red-500">Invalid file. Please try again.</p>
        )}
      </div>
    );
  },
);
SingleImageDropzone.displayName = 'SingleImageDropzone';

export { SingleImageDropzone };
