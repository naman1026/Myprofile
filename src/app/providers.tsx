'use client';

import React from 'react';

// This component is needed because AnimatePresence requires a client boundary
// if it's used within a Server Component tree (like the RootLayout).
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}