import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuthStore } from './store/authStore';
import { getUserData } from './services/authService';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LandingRoute from './components/Auth/LandingRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Applications from './pages/Applications';
import Favorites from './pages/Favorites';
import Vacancies from './pages/Vacancies';
import CreateVacancy from './pages/CreateVacancy';
import EditVacancy from './pages/EditVacancy';
import ViewApplications from './pages/ViewApplications';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import AdminVacancies from './pages/AdminVacancies';
import AdminAnalytics from './pages/AdminAnalytics';
import Talent from './pages/Talent';
import StudentProfile from './pages/StudentProfile';
import SavedProfiles from './pages/SavedProfiles';
import Legal from './pages/Legal';

function App() {
  const { setCurrentUser, setUserData, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userData = await getUserData(user.uid);
          setUserData(userData);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Si hay error cargando datos del usuario, limpiar estado
          setCurrentUser(null);
          setUserData(null);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentUser, setUserData, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route
          path="/"
          element={
            <LandingRoute>
              <Landing />
            </LandingRoute>
          }
        />
        <Route path="/legal" element={<Legal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protegidas */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Layout>
                <Jobs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <JobDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['student']} requireAuth={true}>
              <Layout>
                <Applications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute requireAuth={true}>
              <Layout>
                <Messages />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={['student']} requireAuth={true}>
              <Layout>
                <Favorites />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vacancies"
          element={
            <ProtectedRoute allowedRoles={['company']} requireAuth={true}>
              <Layout>
                <Vacancies />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vacancies/new"
          element={
            <ProtectedRoute allowedRoles={['company']} requireAuth={true}>
              <Layout>
                <CreateVacancy />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vacancies/:vacancyId/applications"
          element={
            <ProtectedRoute allowedRoles={['company']} requireAuth={true}>
              <Layout>
                <ViewApplications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/talent"
          element={
            <ProtectedRoute allowedRoles={['company']} requireAuth={true}>
              <Layout>
                <Talent />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/talent/:studentId"
          element={
            <ProtectedRoute allowedRoles={['company']} requireAuth={true}>
              <Layout>
                <StudentProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-profiles"
          element={
            <ProtectedRoute allowedRoles={['company']} requireAuth={true}>
              <Layout>
                <SavedProfiles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vacancies/:vacancyId/edit"
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <Layout>
                <EditVacancy />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth={true}>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute requireAuth={true}>
              <Layout>
                <EditProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vacancies"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminVacancies />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminAnalytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirecciones */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

