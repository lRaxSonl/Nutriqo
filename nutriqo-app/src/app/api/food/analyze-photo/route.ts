/**
 * POST /api/food/analyze-photo
 * 
 * Анализирует фото еды через OpenAI Vision API (gpt-4o)
 * Требуется: NextAuth сессия, OPENAI_API_KEY в env
 * 
 * Body: { image: string (base64) }
 * Returns: { success: boolean, data?: FoodPhotoAnalysisResult, error?: string }
 */

import { getVerifiedSession } from '@/shared/lib/verifyJWT';
import { FOOD_PHOTO_ANALYSIS_PROMPT, FoodPhotoAnalysisResult } from '@/features/add-food-entry/lib/foodPhotoPrompt';
import { logger } from '@/shared/lib/logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface AnalyzePhotoRequest {
  image: string; // base64 encoded image
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Парсит JSON ответ от GPT, удаляя markdown обертку если есть
 */
function parseGPTResponse(content: string): FoodPhotoAnalysisResult {
  try {
    // Удаляем markdown блоки если они есть
    let jsonStr = content.trim();
    
    // Если начинается с markdown кода
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7); // Удаляем ```json
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3); // Удаляем ```
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3); // Удаляем ```
    }
    
    // Если не начинается с { попробуем найти JSON в тексте
    jsonStr = jsonStr.trim();
    if (!jsonStr.startsWith('{')) {
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      } else {
        throw new Error('No JSON found in response');
      }
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Валидируем базовую структуру
    if (!parsed.product_name || !parsed.calories) {
      throw new Error('Missing required fields in response');
    }
    
    return parsed as FoodPhotoAnalysisResult;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Failed to parse GPT response', 'PARSE_ERROR', {
      error: errorMsg,
      contentPreview: content.substring(0, 300),
    });
    throw new Error('Failed to parse food analysis response');
  }
}

/**
 * Отправляет запрос на OpenAI с изображением
 */
async function analyzeWithOpenAI(base64Image: string): Promise<FoodPhotoAnalysisResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  try {
    const imageSizeKB = Math.round(base64Image.length / 1024);
    logger.info(`Sending image to OpenAI (${imageSizeKB}KB)...`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: FOOD_PHOTO_ANALYSIS_PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'low',
                },
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      logger.error('OpenAI API error', 'OPENAI_ERROR', {
        status: response.status,
        message: errorBody.error?.message,
      });
      throw new Error(`OpenAI API error: ${response.status} ${errorBody.error?.message || 'Unknown error'}`);
    }

    const data: OpenAIResponse = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const responseContent = data.choices[0].message.content;
    logger.info(`OpenAI response received (${responseContent.length} chars)`);

    const analysisResult = parseGPTResponse(responseContent);
    logger.info(`✓ Successfully analyzed: ${analysisResult.product_name}`);

    return analysisResult;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('✗ Analysis failed', 'ANALYSIS_ERROR', { error: errorMsg });
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // SECURITY: Verify JWT signature
    const verifiedSession = await getVerifiedSession();
    if (!verifiedSession?.user) {
      logger.warn('Unauthorized photo analysis attempt - invalid JWT');
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Проверяем подписку - функция photo analysis требует Premium
    if (verifiedSession.user.subscriptionStatus !== 'active') {
      logger.warn(`Photo analysis requested by non-premium user: ${verifiedSession.user.email}`);
      return Response.json(
        {
          success: false,
          error: 'Premium subscription required for photo analysis',
          code: 'SUBSCRIPTION_REQUIRED',
        },
        { status: 403 }
      );
    }

    // Парсим тело запроса
    const body: AnalyzePhotoRequest = await request.json();

    if (!body.image) {
      return Response.json(
        { success: false, error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Валидируем размер изображения (макс 5MB в base64)
    if (body.image.length > 5 * 1024 * 1024) {
      return Response.json(
        { success: false, error: 'Image size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Анализируем фото через OpenAI
    const analysisResult = await analyzeWithOpenAI(body.image);

    return Response.json(
      { success: true, data: analysisResult },
      { status: 200 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Endpoint error', 'ENDPOINT_ERROR', { error: errorMsg });

    return Response.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
