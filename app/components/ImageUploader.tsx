"use client";
import React, { useState } from 'react';
import { uploadImage } from '@/app/services/uploadService';

interface ImageUploaderProps {
  value?: string;
  onChange: (url?: string) => void;
  accept?: string;
  placeholder?: string;
  disabled?: boolean;
  previewSize?: string; // e.g. 'h-16 w-16'
}

export default function ImageUploader({ value, onChange, accept = 'image/*', placeholder = 'Or paste image URL', disabled = false, previewSize = 'h-16 w-16' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [localValue, setLocalValue] = useState(value ?? '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setLocalValue(imageUrl || '');
      onChange(imageUrl || undefined);
    } catch (err) {
      console.error('ImageUploader: upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handlePasteUrl = (val: string) => {
    setLocalValue(val);
    onChange(val || undefined);
  };

  const handleRemove = () => {
    setLocalValue('');
    onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className={`w-full h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors`}>
          {localValue ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={localValue} alt="Preview" className={`${previewSize} object-cover rounded`} />
          ) : (
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500 mt-1">Upload image</p>
            </div>
          )}
        </div>

        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled || uploading}
        />

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={localValue}
          onChange={(e) => handlePasteUrl(e.target.value)}
          className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
          placeholder={placeholder}
        />
        {localValue && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1 text-sm text-red-600 border border-red-100 rounded hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
