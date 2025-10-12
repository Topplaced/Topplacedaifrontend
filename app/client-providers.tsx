'use client';

import { ReduxProvider } from '@/store/provider';

export default function ClientProviders({
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