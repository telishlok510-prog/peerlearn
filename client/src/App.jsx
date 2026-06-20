import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BecomeTutor from "./pages/BecomeTutor.jsx";
import TutorList from "./pages/TutorList.jsx";
import TutorProfile from "./pages/TutorProfile.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import SkillExchange from "./pages/SkillExchange.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Landing from "./pages/Landing.jsx";

// Only allow logged-in users through; otherwise send them to login.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Only allow admins through.
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public home page for guests; logged-in users go to their dashboard. */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
          ) : (
            <Landing />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/become-tutor"
        element={
          <ProtectedRoute>
            <BecomeTutor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutors"
        element={
          <ProtectedRoute>
            <TutorList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutors/:id"
        element={
          <ProtectedRoute>
            <TutorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skill-exchange"
        element={
          <ProtectedRoute>
            <SkillExchange />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
      {/* Anything unknown goes home. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
