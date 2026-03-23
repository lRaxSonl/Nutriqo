import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { EatenFood } from '@/shared/lib/models/EatenFood';
import { logger } from '@/shared/lib/logger';

/**
 * DELETE /api/food/delete-entry
 * Удалить запись о съеденной пище
 */
export async function DELETE(request: NextRequest) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const pbToken = session.pbToken;
    if (!pbToken) {
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Получаем entryId из query параметров
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId is required' },
        { status: 400 }
      );
    }

    // Валидируем entryId формат (должен быть не пуст и разумной длины)
    if (typeof entryId !== 'string' || entryId.length === 0 || entryId.length > 100) {
      return NextResponse.json(
        { error: 'Invalid entryId format' },
        { status: 400 }
      );
    }

    // Создаем аутентифицированный экземпляр модели
    const authenticatedEatenFoodModel = new EatenFood().withAuthToken(pbToken);

    // Сначала проверяем существование записи
    let entry;
    try {
      entry = await authenticatedEatenFoodModel.findById(entryId);
    } catch (findError) {
      logger.error('Food entry not found for deletion', 'FOOD_DELETE_NOT_FOUND', {
        entryId,
        errorMessage: findError instanceof Error ? findError.message : 'Unknown',
      });
      return NextResponse.json(
        { error: 'Food entry not found' },
        { status: 404 }
      );
    }

    // Удаляем запись
    await authenticatedEatenFoodModel.delete(entryId);

    return NextResponse.json(
      { success: true, message: 'Food entry deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    // Безопасное логирование с детальной информацией
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Failed to delete food entry', 'FOOD_DELETE_ERROR', {
      errorMessage,
      stack: errorStack,
    });
    
    // Проверяем тип ошибки и возвращаем соответствующий ответ
    if (errorMessage.includes('not found') || errorMessage.includes('Record not found')) {
      return NextResponse.json(
        { error: 'Food entry not found' },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('permissions') || errorMessage.includes('Access denied')) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this entry' },
        { status: 403 }
      );
    }
    
    // Generic error response
    console.error('Delete entry error details:', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return NextResponse.json(
      { error: 'An error occurred while deleting your food entry. Please try again.' },
      { status: 500 }
    );
  }
}
