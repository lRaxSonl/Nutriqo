import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { SubscribeButton } from '@/features/payment/ui/SubscribeButton';
import { Card } from '@/shared/ui/Card/Card';

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Профиль</h1>
      <Card title="Ваша подписка">
        <p className="mb-4">Статус: <span className="font-bold text-warning">Free</span></p>
        <p className="text-foreground-secondary mb-6">Получите доступ к расширенной аналитике и экспорту данных.</p>
        <SubscribeButton />
      </Card>
    </div>
  );
}