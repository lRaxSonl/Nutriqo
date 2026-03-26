'use client';

/**
 * Компонент drag-and-drop для загрузки фото еды
 * FSD: features/add-food-entry/ui
 */

import React, { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface FoodPhotoDropZoneProps {
  onImageSelect: (base64: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function FoodPhotoDropZone({
  onImageSelect,
  disabled = false,
  isLoading = false,
}: FoodPhotoDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Удаляем префикс "data:image/...;base64,"
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const validateAndProcess = async (file: File) => {
    setError(null);

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, загрузите изображение');
      return;
    }

    // Проверяем размер (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      onImageSelect(base64);
    } catch (err) {
      setError('Ошибка при обработке изображения');
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled || isLoading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-all cursor-pointer
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isLoading}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="w-10 h-10 text-gray-400" />
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Перетащи фото здесь или нажми для выбора
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Поддерживаются JPG, PNG, WebP (макс 5MB)
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Анализирую фото...
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}
    </div>
  );
}
