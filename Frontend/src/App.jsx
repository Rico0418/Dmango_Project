import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import appRoutes from './Route';
import LoadingScreen from './utils/LoadingScreen';

function AppContent() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return(
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    }}>
        <Routes>
          {appRoutes.map(({ path, element }, index) => (
            <Route key={index} path={path} element={element} />
          ))}
        </Routes>
        <ToastContainer position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable />
    </div>
  )
}
function App() {
  return (
    <AuthProvider>
      <Router>
          <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
