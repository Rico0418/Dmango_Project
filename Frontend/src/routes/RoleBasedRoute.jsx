import React from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../utils/LoadingScreen";

const RoleBasedRoute = ({ children, allowedRole }) => {
  const { user,loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== allowedRole) return <Navigate to="/login" />;
  return children;
};

export default RoleBasedRoute;
