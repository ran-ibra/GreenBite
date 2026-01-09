import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const SubscriptionRoute = () => {
  const { isAuthenticated, isSubscribed, loading } = useContext(AuthContext);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSubscribed) {
    return <Navigate to="/pricing" replace />;
  }

  return <Outlet />;
};

export default SubscriptionRoute;
