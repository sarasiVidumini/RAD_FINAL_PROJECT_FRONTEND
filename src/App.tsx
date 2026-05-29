import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Me from './pages/Me';

export default function App() {
  const accessToken = useAuth((state) => state.accessToken);

  return (
    <BrowserRouter>
      <Routes>
        {/* Core Secure Route Guards */}
        <Route path="/" element={accessToken ? <Home /> : <Navigate to="/login" />} />
        <Route path="/about" element={accessToken ? <About /> : <Navigate to="/login" />} />
        <Route path="/me" element={accessToken ? <Me /> : <Navigate to="/login" />} />
        
        {/* Guest Authentication Funnels */}
        <Route path="/login" element={!accessToken ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!accessToken ? <Register /> : <Navigate to="/" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}