import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateLink from "./pages/CreateLink";
import MyLinks from "./pages/MyLinks";
import Analytics from "./pages/Analytics";
import PublicStats from "./pages/PublicStats";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

function AppRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? "/app/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/start" element={<AppRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stats/:shortCode" element={<PublicStats />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="links/new" element={<CreateLink />} />
          <Route path="links" element={<MyLinks />} />
          <Route path="analytics/:id" element={<Analytics />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={2200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
}
