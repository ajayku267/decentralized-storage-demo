import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ onUpload, maxSize = 100 * 1024 * 1024 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await handleFiles(files);
  };

  const handleFiles = async (files) => {
    setError(null);
    
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is ${formatBytes(maxSize)}`);
        continue;
      }

      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setUploadProgress(i);
        }

        await onUpload(file);
        setUploadProgress(100);
      } catch (err) {
        setError(`Error uploading ${file.name}: ${err.message}`);
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary-main bg-primary-main/5'
            : 'border-gray-300 hover:border-primary-main'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <motion.div
              className="w-16 h-16 rounded-full bg-primary-main/10 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <svg
                className="w-8 h-8 text-primary-main"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </motion.div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Drag and drop your files here
            </h3>
            <p className="text-sm text-gray-500">
              or{' '}
              <button
                className="text-primary-main hover:text-primary-dark font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: {formatBytes(maxSize)}
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                className="bg-primary-main h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Uploading... {uploadProgress}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload; 