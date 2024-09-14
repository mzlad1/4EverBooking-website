import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext"; // Ensure the path is correct

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const { isLoggedIn } = useAuth();
  const userRole = localStorage.getItem("role"); // Get the user's role

  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn && allowedRoles.includes(userRole) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/unauthorized" />
        )
      }
    />
  );
};

export default ProtectedRoute;
