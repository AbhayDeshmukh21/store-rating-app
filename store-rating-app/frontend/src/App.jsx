// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetails from "./pages/AdminUserDetails";
import AdminStores from "./pages/AdminStores";
import UserStores from "./pages/UserStores";
import OwnerDashboard from "./pages/OwnerDashboard";

import "./App.css";

function HomeRedirect() {
  // Sends a logged-in user to their role's default page, or to login otherwise.
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "STORE_OWNER") return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={["USER", "STORE_OWNER", "ADMIN"]}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminStores />
            </ProtectedRoute>
          }
        />

        {/* Normal user routes */}
        <Route
          path="/stores"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserStores />
            </ProtectedRoute>
          }
        />

        {/* Store owner routes */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={["STORE_OWNER"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
