import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute"; 
import RoleBasedRoute from "./routes/RoleBasedRoute"; 
import LoadingScreen from "./pages/LoadingScreen";
import { LazyWithTimeout } from "./utils/LazyWithTimeout";

const LazyLoader = (Component) => (
  <Suspense fallback={<LoadingScreen />}>
    {React.createElement(Component)} 
  </Suspense>
);

const Login = LazyWithTimeout(() => import("./pages/LoginPage"));
const Register = LazyWithTimeout(() => import("./pages/RegisterPage"));
const Home = LazyWithTimeout(() => import("./pages/HomePage"));
const ManageRooms = LazyWithTimeout(() => import("./pages/admin/ManageRooms"));
const UpdateRooms = LazyWithTimeout(() => import("./pages/admin/UpdateRoomAdmin"));
const UserProfile = LazyWithTimeout(() => import("./pages/UserProfilePage"));
const Contact = LazyWithTimeout(()=> import("./pages/ContactPage"));
const ManageComplaints = LazyWithTimeout(() => import("./pages/admin/ManageComplaints"));
const ManageBookings = LazyWithTimeout(() => import("./pages/admin/ManageBookings"));
const ManagePaymentDetail = LazyWithTimeout(() => import("./pages/admin/ManagePaymentDetail"));
// const BookingHistory = lazy(() => import("./pages/customer/BookingHistory"));
const RoomList = LazyWithTimeout(() => import("./pages/customer/GetAllRoom"));
const RoomDetail = LazyWithTimeout(() => import("./pages/customer/GetDetailRoom"));

const routesConfig = [
  { path: "/login", element: Login, protected: false },
  { path: "/register", element: Register, protected: false },

  // Common protected routes (accessible to all authenticated users)
  { path: "/", element: Home, protected: true },
  { path: "/user/profile/:id", element: UserProfile, protected: true},
  { path: "/contact", element: Contact, protected: true},

  // // Admin Routes (only accessible by admin)
  { path: "/admin/manage-complaints", element: ManageComplaints, role: "admin", protected: true },
  { path: "/admin/manage-rooms/update/:id", element: UpdateRooms, role: "admin", protected: true },
  { path: "/admin/manage-rooms", element: ManageRooms, role: "admin", protected: true },
  { path: "/admin/manage-bookings", element: ManageBookings, role: "admin", protected: true },
  { path: "/admin/manage-payments", element: ManagePaymentDetail, role: "admin", protected: true},

  // // Customer Routes (only accessible by customers)
  // { path: "/customer/bookings", element: <BookingHistory />, role: "customer", protected: true },
  { path: "/customer/rooms", element: RoomList, role: "customer", protected: true },
  { path: "/customer/rooms/:id", element: RoomDetail, role: "customer", protected: true}
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
