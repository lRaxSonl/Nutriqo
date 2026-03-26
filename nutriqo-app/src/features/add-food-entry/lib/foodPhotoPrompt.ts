/**
 * Промпт для анализа фотографии еды через OpenAI Vision API (gpt-4o)
 * Возвращает JSON с информацией о пищевой ценности
 */

export const FOOD_PHOTO_ANALYSIS_PROMPT = `You are a professional nutritionist and food analysis expert. Analyze the food photo carefully.

CRITICAL: You MUST respond with ONLY valid JSON, nothing else. No markdown, no explanations, no text before or after.

If you cannot analyze the image, still provide a JSON response with confidence: "low" and appropriate estimated values.

Return this JSON structure:
{
  "product_name": "Exact food name in Russian",
  "description": "Brief description of ingredients and preparation visible",
  "portion_size": "Estimated portion weight in grams",
  "calories": Estimated calories as a number,
  "protein": Protein in grams as decimal,
  "fat": Fat in grams as decimal,
  "carbohydrates": Carbs in grams as decimal,
  "confidence": "high" or "medium" or "low",
  "notes": "Additional notes about estimation accuracy"
}

RULES:
1. MUST return valid JSON only
2. Confidence: "high" if food is clearly visible and identifiable, "low" if unclear
3. If image cannot be analyzed, estimate based on similar foods
4. All numeric values must be numbers, not strings
5. Portion size is typically 100-300g for solid food, 200-300ml for drinks
6. Use these macro ratios as fallback: Protein 15%, Fat 30%, Carbs 55% of calories

Start your response with { and end with }`;

/**
 * Альтернативный промпт для более строгого анализа (если нужна большая точность)
 */
export const FOOD_PHOTO_ANALYSIS_STRICT = `Ты - диетолог. Анализируй фото еды и возвращай JSON:

{
  "product_name": "название",
  "portion_size": "вес в граммах",
  "calories": число,
  "protein": число,
  "fat": число,
  "carbohydrates": число,
  "confidence": "high"|"medium"|"low",
  "notes": "примечания"
}

Только JSON, без текста.`;

/**
 * Тип ответа от API анализа фото
 */
export interface FoodPhotoAnalysisResult {
  product_name: string;
  description?: string;
  portion_size: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}
