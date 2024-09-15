import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext"; // Ensure the path is correct

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const { isLoggedIn } = useAuth();
  const userRole = localStorage.getItem("role"); // Get the user's role from localStorage

  return (
    <Route
      {...rest}
      render={(props) => {
        // Allow access if the user is not logged in (guest) or the role is CUSTOMER
        if (!isLoggedIn || (isLoggedIn && allowedRoles.includes(userRole))) {
          return <Component {...props} />;
        }

        // If the user is logged in but not a CUSTOMER, redirect to unauthorized page
        return <Redirect to="/unauthorized" />;
      }}
    />
  );
};

export default ProtectedRoute;
