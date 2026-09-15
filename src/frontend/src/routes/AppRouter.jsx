import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Disruptions from '../pages/Disruptions';
import DisruptionDetail from '../pages/DisruptionDetail';
import Shipments from '../pages/Shipments';
import ShipmentDetail from '../pages/ShipmentDetail';
import Fleet from '../pages/Fleet';
import ColdChain from '../pages/ColdChain';
import Recovery from '../pages/Recovery';
import PlansList from '../pages/PlansList';
import Plans from '../pages/Plans';
import Copilot from '../pages/Copilot';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/disruptions" element={<ProtectedRoute><Disruptions /></ProtectedRoute>} />
        <Route path="/disruptions/:id" element={<ProtectedRoute><DisruptionDetail /></ProtectedRoute>} />
        
        <Route path="/shipments" element={<ProtectedRoute><Shipments /></ProtectedRoute>} />
        <Route path="/shipments/:id" element={<ProtectedRoute><ShipmentDetail /></ProtectedRoute>} />
        
        <Route path="/fleet" element={<ProtectedRoute><Fleet /></ProtectedRoute>} />
        
        <Route path="/cold-chain" element={<ProtectedRoute><ColdChain /></ProtectedRoute>} />
        <Route path="/recovery/:id" element={<ProtectedRoute><Recovery /></ProtectedRoute>} />
        
        <Route path="/plans" element={<ProtectedRoute><PlansList /></ProtectedRoute>} />
        <Route path="/plans/:id" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
        
        <Route path="/copilot" element={<ProtectedRoute><Copilot /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
