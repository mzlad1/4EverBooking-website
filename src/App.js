import "./App.css";
import Navbar from "./Common/Navbar/Navbar";
import Home from "./Components/pages/Home";
import About from "./Components/About/About";
import Unauthorized from "./Components/Dashboard/Unauthorized";
import ReservationSuccess from "./Components/Halls/ReservationSuccess";
import ProtectedRoute from "./Components/Dashboard/ProtectedRoute";
import ReservationProtectedRoute from "./Components/Halls/ReservationProtectedRoute";
import Dashboard from "./Components/Dashboard/Dashboard";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
} from "react-router-dom"; // BrowserRouter wraps everything
import { AuthProvider } from "./Context/AuthContext";
import BlogSingle from "./Components/Blog/blog-single-page/BlogSingle";
import Testimonial from "./Components/Testimonial/Testimonial";
import Contact from "./Components/Contact/Contact";
import Footer from "./Common/footer/Footer";
import Login from "./Components/login/Login";
import Register from "./Components/login/Register";
import HallsPage from "./Components/Halls/HallsPage";
import ReservationPage from "./Components/Halls/ReservationPage";
import HallDetailsPage from "./Components/Halls/HallDetailsPage";
import FavoritesPage from "./Components/Halls/Favorites";
import NoReserveInfo from "./Components/Halls/noreserveinfo";
import ResetPassword from "./Components/login/ResetPassword";
import "./i18n"; // Import the i18n initialization

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp /> 
      </Router>
    </AuthProvider>
  );
}

function MainApp() {
  const location = useLocation(); // useLocation is now safely inside the Router

  const noHeaderFooterRoutes = ["/sign-in", "/register", "/reset-password"];
  const shouldHideHeaderFooter = noHeaderFooterRoutes.includes(
    location.pathname
  );

  return (
    <>
      {!shouldHideHeaderFooter && <Navbar />}{" "}
      {/* Show Navbar unless on sign-in or register */}
      <Switch>
        <Route path="/detailsError" component={NoReserveInfo} />
        <Route path="/unauthorized" component={Unauthorized} />
        <ProtectedRoute
          path="/"
          exact
          component={Home}
          allowedRoles={["CUSTOMER", "HALL_OWNER"]}
        />
        <Route path="/favorites" component={FavoritesPage} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/about" exact component={About} />
        <ProtectedRoute
          path="/halls"
          component={HallsPage}
          allowedRoles={["CUSTOMER"]}
        />
        <ProtectedRoute
          path="/hall/:id"
          component={HallDetailsPage}
          allowedRoles={["CUSTOMER"]}
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
        <Route path="/register" component={Register} />
      </Switch>
      {!shouldHideHeaderFooter && <Footer />}{" "}
      {/* Show Footer unless on sign-in or register */}
    </>
  );
}

export default App;
