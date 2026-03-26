'use client';

/**
 * Модал для отображения результатов анализа фото
 * FSD: features/add-food-entry/ui
 */

import React from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FoodPhotoAnalysisResult } from '@/features/add-food-entry/lib/foodPhotoPrompt';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FoodPhotoAnalysisResult | null;
  isLoading?: boolean;
  onConfirm?: (editedData: FoodPhotoAnalysisResult) => void;
}

const CONFIDENCE_COLORS = {
  high: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
  low: { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
};

const CONFIDENCE_LABELS = {
  high: 'Высокая точность',
  medium: 'Средняя точность',
  low: 'Низкая точность',
};

export function AnalysisResultModal({
  isOpen,
  onClose,
  result,
  isLoading = false,
  onConfirm,
}: AnalysisResultModalProps) {
  const [editedData, setEditedData] = React.useState<FoodPhotoAnalysisResult | null>(result);

  React.useEffect(() => {
    setEditedData(result);
  }, [result]);

  if (!isOpen || !editedData) return null;

  const confidenceConfig = CONFIDENCE_COLORS[editedData.confidence];
  const handleConfirm = () => {
    if (onConfirm && editedData) {
      onConfirm(editedData);
    }
  };

  const updateField = <K extends keyof FoodPhotoAnalysisResult>(
    key: K,
    value: FoodPhotoAnalysisResult[K]
  ) => {
    setEditedData((prev) => prev ? { ...prev, [key]: value } : null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Результаты анализа
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Confidence Badge */}
          <div
            className={`flex items-center gap-2 p-3 rounded-lg border ${confidenceConfig.bg} ${confidenceConfig.border}`}
          >
            {editedData.confidence === 'high' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            )}
            <span className={`text-sm font-medium ${confidenceConfig.text}`}>
              {CONFIDENCE_LABELS[editedData.confidence]}
            </span>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Название
            </label>
            <Input
              value={editedData.product_name}
              onChange={(e) => updateField('product_name', e.target.value)}
              placeholder="Название продукта"
              className="text-sm"
            />
          </div>

          {/* Description */}
          {editedData.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Описание
              </label>
              <textarea
                value={editedData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Описание"
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md text-sm resize-none dark:bg-gray-800 dark:text-white"
                rows={2}
              />
            </div>
          )}

          {/* Portion Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Размер порции
            </label>
            <Input
              value={editedData.portion_size}
              onChange={(e) => updateField('portion_size', e.target.value)}
              placeholder="Размер порции"
              className="text-sm"
            />
          </div>

          {/* Calories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Калории
            </label>
            <Input
              type="number"
              value={editedData.calories}
              onChange={(e) => updateField('calories', parseFloat(e.target.value) || 0)}
              placeholder="Калории"
              className="text-sm"
            />
          </div>

          {/* Macronutrients Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Белки (г)
              </label>
              <Input
                type="number"
                value={editedData.protein}
                onChange={(e) => updateField('protein', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className="text-sm"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Жиры (г)
              </label>
              <Input
                type="number"
                value={editedData.fat}
                onChange={(e) => updateField('fat', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className="text-sm"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Углеводы (г)
              </label>
              <Input
                type="number"
                value={editedData.carbohydrates}
                onChange={(e) => updateField('carbohydrates', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className="text-sm"
                step="0.1"
              />
            </div>
          </div>

          {/* Notes */}
          {editedData.notes && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Примечание:</span> {editedData.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-2 p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Отменить
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Сохранение...' : 'Добавить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
