import React, { useState } from 'react';
import Image from 'next/image';
import { Category } from '../services/categoryService';

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onAddChild: (parentId: string) => void;
  level?: number;
}

export default function CategoryTree({
  categories,
  onEdit,
  onDelete,
  onAddChild,
  level = 0
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (categoryId: string) => {
    setExpanded(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const indent = level * 24;

  return (
    <div>
      {categories.map((category) => (
        <div key={category.categoryId} className="select-none">
          <div
            className="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer group"
            style={{ paddingLeft: `${indent}px` }}
          >
            {/* Expand/Collapse Icon or Spacer */}
            {category.children && category.children.length > 0 ? (
              <button
                onClick={() => toggleExpanded(category.categoryId)}
                className="mr-2 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                {expanded[category.categoryId] ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            ) : (
              <div className="mr-2 w-4 h-4"></div>
            )}

            {/* Category Icon/Image */}
            <div className="mr-3 w-6 h-6 flex items-center justify-center">
              {category.imageUrl ? (
                <div className="w-6 h-6 relative rounded overflow-hidden">
                  <Image src={category.imageUrl} alt={category.name} fill sizes="24px" className="object-cover" />
                </div>
              ) : category.icon ? (
                <span className="text-lg">{category.icon}</span>
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              )}
            </div>

            {/* Category Name */}
            <span className="flex-1 text-sm font-medium text-gray-900">
              {category.name}
            </span>

            {/* Action Buttons */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
              <button
                onClick={() => onAddChild(category.categoryId)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="Add subcategory"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={() => onEdit(category)}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                title="Edit category"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(category.categoryId)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Delete category"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Children */}
          {category.children && category.children.length > 0 && expanded[category.categoryId] && (
            <CategoryTree
              categories={category.children}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}