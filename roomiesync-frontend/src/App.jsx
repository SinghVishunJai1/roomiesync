import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Expenses from "./pages/Expenses";
import Bounties from "./pages/Bounties";
import Roommates from "./pages/Roommates";
import AdminPanel from "./pages/AdminPanel";
import Layout from "./components/Layout"; // Layout import kiya

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/bounties" element={<Bounties />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/roommates" element={<Roommates />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
