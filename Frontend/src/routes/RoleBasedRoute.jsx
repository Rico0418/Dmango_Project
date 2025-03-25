import React from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const RoleBasedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    return decoded.role === allowedRole ? children : <Navigate to="/" />;
  } catch (error) {
    return <Navigate to="/login" />;
  }
};

export default RoleBasedRoute;
