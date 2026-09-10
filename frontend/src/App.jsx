import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
function ProtectedRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/" replace />;
}
export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
