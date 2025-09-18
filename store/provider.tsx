'use client';

import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { useEffect, useState } from 'react';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Provider store={store}>{children}</Provider>;
  }

  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white">Loading...</div>
          </div>
        } 
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
