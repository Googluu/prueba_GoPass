import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider }     from './contexts/AuthContext';
import { ThemeProvider }    from './contexts/ThemeContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import Landing       from './pages/Landing';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,        // 1 min — revalida en background
      gcTime:    1000 * 60 * 60 * 24, // 24h en localStorage
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'taskflow-cache',
  throttleTime: 1000,
});

function WorkspaceRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/proyectos"     element={<Dashboard />} />
        <Route path="/proyectos/:id" element={<ProjectDetail />} />
      </Routes>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
      >
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"         element={<Landing />} />
              <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/*"        element={<WorkspaceRoutes />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
