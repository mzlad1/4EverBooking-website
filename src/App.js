import "./App.css";
import Navbar from "./Common/Navbar/Navbar";
import Home from "./Components/pages/Home";
import About from "./Components/About/About";
import Unauthorized from "./Components/Dashboard/Unauthorized"; // Error page for unauthorized access
//import Destinations from "./Components/Destinations/Destinations"
//import DHome from "./Components/Destinations/Home"
import ReservationSuccess from "./Components/Halls/ReservationSuccess";
import ProtectedRoute from "./Components/Dashboard/ProtectedRoute";
import ReservationProtectedRoute from "./Components/Halls/ReservationProtectedRoute";
import Dashboard from "./Components/Dashboard/Dashboard";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext"; // Adjust the path as needed
/*-------------blog------------ */
import BlogSingle from "./Components/Blog/blog-single-page/BlogSingle";
import Testimonial from "./Components/Testimonial/Testimonial";
import Contact from "./Components/Contact/Contact";
import Footer from "./Common/footer/Footer";
import Login from "./Components/login/Login";
import Register from "./Components/login/Register";
import HallsPage from "./Components/Halls/HallsPage";
import ReservationPage from "./Components/Halls/ReservationPage";
import HallDetailsPage from "./Components/Halls/HallDetailsPage";
import NoReserveInfo from "./Components/Halls/noreserveinfo";
import ResetPassword from "./Components/login/ResetPassword";
/*-------------blog------------ */

import "./i18n"; // Import the i18n initialization

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Navbar />
          <Switch>
            <Route path="/detailsError" component={NoReserveInfo} />
            <Route path="/unauthorized" component={Unauthorized} />
            <Route path="/" exact component={Home} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/about" exact component={About} />
            <ProtectedRoute
              path="/halls"
              component={HallsPage}
              allowedRoles={["CUSTOMER", "ADMIN"]} // Only allow CUSTOMER and ADMIN
            />{" "}
            <ProtectedRoute
              path="/hall/:id"
              component={HallDetailsPage}
              allowedRoles={["CUSTOMER", "ADMIN"]}
            />
            <ReservationProtectedRoute
              path="/reserve"
              component={ReservationPage}
            />
            <ReservationProtectedRoute
              path="/reservation-success"
              component={ReservationSuccess}
            />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/halls" exact component={HallsPage} />
            <Route path="/testimonial" component={Testimonial} />
            <Route path="/contact" component={Contact} />
            <Route path="/sign-in" component={Login} />
            <Route path="/Register" component={Register} />
          </Switch>
          <Footer />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
