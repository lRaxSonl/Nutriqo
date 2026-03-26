'use client';

/**
 * Вкладка для анализа фото еды
 * FSD: features/add-food-entry/ui
 */

import React, { useState } from 'react';
import { Camera, Lock } from 'lucide-react';
import { useSubscription } from '@/shared/api';
import { FoodPhotoDropZone } from './FoodPhotoDropZone';
import { AnalysisResultModal } from './AnalysisResultModal';
import { useAnalyzePhoto } from '@/features/add-food-entry/api/useAnalyzePhoto';
import { FoodPhotoAnalysisResult } from '@/features/add-food-entry/lib/foodPhotoPrompt';
import { Button } from '@/shared/ui/Button/Button';

interface FoodPhotoTabProps {
  onFoodAnalyzed?: (result: FoodPhotoAnalysisResult) => void;
}

export function FoodPhotoTab({ onFoodAnalyzed }: FoodPhotoTabProps) {
  const [showModal, setShowModal] = useState(false);
  const { loading, error, data, analyzePhoto, reset } = useAnalyzePhoto();
  const { isPremium } = useSubscription();

  const handleImageSelected = async (base64Image: string) => {
    if (!isPremium) {
      // Ошибка будет показана в UI
      return;
    }
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

  if (!isPremium) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
          <Camera className="w-5 h-5" />
          <p className="text-sm">
            Анализ фото еды — функция для Premium подписки
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Требуется Premium подписка
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Функция анализа фотографий еды доступна только для подписчиков. Оформите подписку всего за $4.99 в месяц и начните анализировать блюда одним кликом.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => {
                    // Скроллим до SubscribeButton на странице profile
                    window.location.href = '/profile?scroll=subscribe';
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                >
                  💳 Оформить подписку
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        error={error}
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
