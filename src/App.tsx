import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';
import { AuthProvider } from './context/AuthContext';
import MaintenancePage from './pages/public/MaintenancePage';
import './App.css';

import { Toaster } from '@/components/ui/sonner';

// SET THIS TO TRUE TO ENABLE MAINTENANCE MODE GLOBALLY
const MAINTENANCE_MODE = false;

function App() {
  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
