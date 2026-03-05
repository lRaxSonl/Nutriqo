import { LoginForm } from '@/features/auth/ui/LoginForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) redirect('/');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm />
    </div>
  );
}