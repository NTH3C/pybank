import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Check if the user is authenticated
  const location = useLocation(); // Get the current route

  if (!token) {
    // If no token, redirect to login with the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists, allow access
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
