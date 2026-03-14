'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useTheme } from 'next-themes';
import { useLayoutEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Hydration check - only render after hydration
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg text-foreground hover:bg-background-secondary transition-colors border border-border"
      aria-label="Переключить тему"
      title={isDark ? 'Перейти на светлую тему' : 'Перейти на тёмную тему'}
    >
      {isDark ? (
        // Sun icon for light mode
        <svg
          className="w-5 h-5 text-warning"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4.293 1.293a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L15 4.414a1 1 0 010-1.414zm2.828 2.829a1 1 0 011.415 0l.707.707a1 1 0 01-1.415 1.415l-.707-.707a1 1 0 010-1.415zM18 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm-1.293 4.293a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414l-1.414-1.414a1 1 0 010-1.414zm2.828 2.829a1 1 0 011.415 0l.707.707a1 1 0 01-1.415 1.415l-.707-.707a1 1 0 010-1.415zM10 18a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm-4.293-1.293a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L5.414 18a1 1 0 010-1.414zm2.828-2.829a1 1 0 011.415 0l.707.707a1 1 0 01-1.415 1.415l-.707-.707a1 1 0 010-1.415zM2 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm1.293-4.293a1 1 0 011.414 0l1.414 1.414a1 1 0 01-1.414 1.414L3.414 6a1 1 0 010-1.414zM3.586 12a1 1 0 011.415 0l.707.707a1 1 0 01-1.415 1.415l-.707-.707a1 1 0 010-1.415zM10 5a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          className="w-5 h-5 text-primary"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};
