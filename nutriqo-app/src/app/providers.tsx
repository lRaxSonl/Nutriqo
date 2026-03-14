'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ToasterProvider } from '@/shared/providers/ToasterProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SessionProvider>
        <ToasterProvider />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}