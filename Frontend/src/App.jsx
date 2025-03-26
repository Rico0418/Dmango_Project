import { useState } from 'react'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import appRoutes from './Route';

function AppContent() {
  return(
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    }}>
      <Router>
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
      </Router>
    </div>
  )
}
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
