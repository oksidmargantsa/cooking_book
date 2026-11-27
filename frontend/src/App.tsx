import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '@/auth/AuthContext';
import Placeholder from '@/pages/Placeholder';
import AuthPage from '@/pages/AuthPage';
import AppLayout from '@/layout/AppLayout';
import SearchPage from '@/pages/SearchPage';
import RecipePage from '@/pages/RecipePage';
import RecipeFormPage from '@/pages/RecipeFormPage';
import ProfilePage from '@/pages/ProfilePage';
import MyRecipesPage from '@/pages/MyRecipesPage';
import FoldersPage from '@/pages/FoldersPage';
import FolderPage from '@/pages/FolderPage';
import SettingsPage from '@/pages/SettingsPage';

function Protected({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace state={{ from: loc.pathname }} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<AppLayout />}>
      <Route index element={<SearchPage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="recipes/:id" element={<RecipePage />} />
      <Route path="recipes/new" element={<Protected><RecipeFormPage /></Protected>} />
      <Route path="recipes/:id/edit" element={<Protected><RecipeFormPage /></Protected>} />
      <Route path="profile" element={<Protected><ProfilePage /></Protected>} />
      <Route path="settings/*" element={<Protected><SettingsPage /></Protected>} />
      <Route path="my-recipes" element={<Protected><MyRecipesPage /></Protected>} />
      <Route path="folders" element={<Protected><FoldersPage /></Protected>} />
      <Route path="folders/:id" element={<Protected><FolderPage /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
