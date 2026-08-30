import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AppRoutes />
      </TenantProvider>
    </BrowserRouter>
  );
};

export default App;
