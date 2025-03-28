import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute"; 
import RoleBasedRoute from "./routes/RoleBasedRoute"; 

const LazyLoader = (Component) => (
  <Suspense fallback={<div>Loading...</div>}>
    {React.createElement(Component)} 
  </Suspense>
);

const Login = lazy(() => import("./pages/LoginPage"));
const Register = lazy(() => import("./pages/RegisterPage"));
const Home = lazy(() => import("./pages/HomePage"));
const ManageRooms = lazy(() => import("./pages/admin/ManageRooms"));
const UpdateRooms = lazy(() => import("./pages/admin/UpdateRoomAdmin"));
const UserProfile = lazy(() => import("./pages/UserProfilePage"));
const Contact = lazy(()=> import("./pages/ContactPage"));
// const BookingHistory = lazy(() => import("./pages/customer/BookingHistory"));
// const RoomList = lazy(() => import("./pages/customer/RoomList"));

const routesConfig = [
  { path: "/login", element: Login, protected: false },
  { path: "/register", element: Register, protected: false },

  // Common protected routes (accessible to all authenticated users)
  { path: "/", element: Home, protected: true },
  { path: "/user/profile/:id", element: UserProfile, protected: true},
  { path: "/contact", element: Contact, protected: true},

  // // Admin Routes (only accessible by admin)
  { path: "/admin/manage-rooms/update/:id", element: UpdateRooms, role: "admin", protected: true },
  { path: "/admin/manage-rooms", element: ManageRooms, role: "admin", protected: true },

  // // Customer Routes (only accessible by customers)
  // { path: "/customer/bookings", element: <BookingHistory />, role: "customer", protected: true },
  // { path: "/customer/rooms", element: <RoomList />, role: "customer", protected: true },
];

const appRoutes = [
  ...routesConfig.map(({ path, element, protected: isProtected, role }) => ({
    path,
    element: isProtected ? (
      role ? (
        <RoleBasedRoute allowedRole={role}>{LazyLoader(element)}</RoleBasedRoute>
      ) : (
        <ProtectedRoute>{LazyLoader(element)}</ProtectedRoute>
      )
    ) : (
      LazyLoader(element)
    ),
  })),
  { path: "*", element: <Navigate to="/" /> }, 
];

export default appRoutes;
