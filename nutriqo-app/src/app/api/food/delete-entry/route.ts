import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { EatenFood } from '@/shared/lib/models/EatenFood';

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

    // Создаем аутентифицированный экземпляр модели
    const authenticatedEatenFoodModel = new EatenFood().withAuthToken(pbToken);

    // Удаляем запись
    try {
      await authenticatedEatenFoodModel.delete(entryId);
    } catch (deleteError) {
      console.error('Error deleting food entry:', deleteError);
      throw deleteError;
    }

    return NextResponse.json(
      { success: true, message: 'Food entry deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/food/delete-entry:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
