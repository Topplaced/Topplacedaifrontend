'use client';

import { ReduxProvider } from '@/store/provider';

export function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      {children}
    </ReduxProvider>
  );
}