import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../utils/LoadingScreen";

const ProtectedRoute = ({ children }) => {
  const { user,loading } = useAuth(); 
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
