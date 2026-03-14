import { DailyTrackerWidget } from '@/widgets/daily-tracker/ui/DailyTrackerWidget';

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">🥑 Nutriqo</h1>
          <p className="text-foreground-secondary mt-2 text-lg">Ваш персональный трекер пищевых привычек</p>
        </header>
        
        <DailyTrackerWidget />
      </div>
    </main>
  );
}