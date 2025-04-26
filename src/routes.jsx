import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./AuthPages/Login";
import Signup from "./AuthPages/Signup";
import ForgotPass from "./AuthPages/ForgotPass";
import AdminLogin from "./AuthPages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminMovies from "./pages/AdminMovies";
import AdminUsers from "./pages/AdminUsers";
import Profile from "./pages/Profile";
import WatchMovie from "./pages/WatchMovie";

// Protected Route component for admin dashboard
const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPass />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <Admin />
          </ProtectedAdminRoute>
        } 
      />
      <Route
        path="/admin/movies"
        element={
          <ProtectedAdminRoute>
            <AdminMovies />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedAdminRoute>
            <AdminUsers />
          </ProtectedAdminRoute>
        }
      />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/watch/:movieId" element={
        <ProtectedRoute>
          <WatchMovie />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
