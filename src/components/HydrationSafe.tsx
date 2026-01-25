'use client';

import { useState, useEffect, ReactNode } from 'react';

interface HydrationSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that prevents hydration mismatches
 * by only rendering children after the component has mounted on the client.
 */
export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback;
  }

  return <>{children}</>;
}
