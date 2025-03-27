import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FileList = ({ files, onFileClick, onFileDelete }) => {
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'document':
        return '📄';
      default:
        return '📁';
    }
  };

  const filteredFiles = files
    .filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-main"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-primary-main text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-primary-main text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-main w-64"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* File List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
      >
        <AnimatePresence>
          {filteredFiles.map((file) => (
            <motion.div
              key={file.id}
              variants={itemVariants}
              layout
              className={`${
                viewMode === 'grid'
                  ? 'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow'
                  : 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'
              }`}
            >
              <div
                className={`${
                  viewMode === 'grid'
                    ? 'p-4 cursor-pointer'
                    : 'p-4 flex items-center space-x-4 cursor-pointer'
                }`}
                onClick={() => onFileClick(file)}
              >
                <div
                  className={`${
                    viewMode === 'grid'
                      ? 'w-16 h-16 mx-auto mb-4'
                      : 'w-12 h-12'
                  } rounded-lg bg-primary-main/10 flex items-center justify-center`}
                >
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                </div>

                <div className={viewMode === 'grid' ? 'text-center' : 'flex-1'}>
                  <h3 className="font-medium text-gray-900 truncate">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatBytes(file.size)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(file.uploadDate)}
                  </p>
                </div>

                {viewMode === 'list' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileDelete(file);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      <AnimatePresence>
        {filteredFiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-main/10 flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No files found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Upload some files to get started'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileList; 