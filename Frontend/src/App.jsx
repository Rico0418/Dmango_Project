import { useState } from 'react'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import appRoutes from './Route';
function App() {

  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App
