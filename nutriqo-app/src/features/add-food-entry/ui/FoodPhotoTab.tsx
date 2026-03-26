'use client';

/**
 * Вкладка для анализа фото еды
 * FSD: features/add-food-entry/ui
 */

import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { FoodPhotoDropZone } from './FoodPhotoDropZone';
import { AnalysisResultModal } from './AnalysisResultModal';
import { useAnalyzePhoto } from '@/features/add-food-entry/api/useAnalyzePhoto';
import { FoodPhotoAnalysisResult } from '@/features/add-food-entry/lib/foodPhotoPrompt';

interface FoodPhotoTabProps {
  onFoodAnalyzed?: (result: FoodPhotoAnalysisResult) => void;
}

export function FoodPhotoTab({ onFoodAnalyzed }: FoodPhotoTabProps) {
  const [showModal, setShowModal] = useState(false);
  const { loading, error, data, analyzePhoto, reset } = useAnalyzePhoto();

  const handleImageSelected = async (base64Image: string) => {
    try {
      await analyzePhoto(base64Image);
      setShowModal(true);
    } catch (err) {
      // Ошибка уже обработана в hook
    }
  };

  const handleConfirm = (editedData: FoodPhotoAnalysisResult) => {
    onFoodAnalyzed?.(editedData);
    setShowModal(false);
    reset();
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
        <Camera className="w-5 h-5" />
        <p className="text-sm">
          Загрузи фото блюда, а нейросеть определит калории и БЖУ
        </p>
      </div>

      <FoodPhotoDropZone
        onImageSelect={handleImageSelected}
        isLoading={loading}
        disabled={false}
      />

      <AnalysisResultModal
        isOpen={showModal}
        onClose={handleClose}
        result={data}
        isLoading={loading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
