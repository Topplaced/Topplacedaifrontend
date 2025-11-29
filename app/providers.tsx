'use client';

import { ReduxProvider } from '@/store/provider';

export default function Providers({
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