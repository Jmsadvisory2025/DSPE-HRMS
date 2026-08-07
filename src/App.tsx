import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';
import { AuthProvider } from './context/AuthContext';
import './App.css';

import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
