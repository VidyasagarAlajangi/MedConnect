import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (location.pathname.startsWith("/doctor/")) {
    return children;
  }

  if (!isAuthenticated) {
    localStorage.setItem("redirectUrl", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  if (user) {
    switch (user.role) {
      case "doctor":
        return <Navigate to="/doctor-dashboard" replace />;
      case "admin":
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Navigate to="/" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;