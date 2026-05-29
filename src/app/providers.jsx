'use client';

import { ThemeProvider } from 'next-themes';

export function ThemeProviderComponent({ children }) {
  return (
    // disableTransitionOnChange prevents flash of unstyled content on theme switch
    // enableSystem is disabled so portfolio always starts in dark mode by default
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}

