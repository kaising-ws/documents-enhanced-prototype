import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { DocumentListPage } from './pages/DocumentListPage';
import { DocumentDetailsPage } from './pages/DocumentDetailsPage';
import { DocumentEditPage } from './pages/DocumentEditPage';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/documents" replace />} />
            <Route path="/documents" element={<DocumentListPage />} />
            <Route path="/documents/new" element={<DocumentEditPage />} />
            <Route path="/documents/:id" element={<DocumentDetailsPage />} />
            <Route path="/documents/:id/edit" element={<DocumentEditPage />} />
            <Route path="*" element={<Navigate to="/documents" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
