import React from "react";
import { Route, Redirect } from "react-router-dom";

const ReservationProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const reservationDetails = localStorage.getItem("reservationDetails");

        // If reservation details are missing, redirect to HallDetailsPage
        if (!reservationDetails) {
          return <Redirect to="/detailsError" />;
        }

        // Otherwise, render the component
        return <Component {...props} />;
      }}
    />
  );
};

export default ReservationProtectedRoute;
