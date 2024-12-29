import React, { useEffect, useState } from "react";
import {
  Route,
  NavLink,
  Switch,
  useRouteMatch,
  useHistory,
} from "react-router-dom";
import { useAuth } from "../../Context/AuthContext"; // Import the useAuth hook
import ProtectedRoute from "./ProtectedRoute"; // Import the new ProtectedRoute component
import EditProfile from "./EditProfile";
import ReservedHalls from "./reservedHalls";
import AddNewHall from "./hall_owner/AddNewHall";
import MyHalls from "./hall_owner/MyHalls";
import UpdateHallPage from "./hall_owner/updateHall";
import AllUsers from "./admin/AllUsers";
import ProcessHalls from "./admin/ProcessHalls";
import DeletedUser from "./admin/DeletedUser";
import DeletedHalls from "./hall_owner/DeletedHalls";
import { useTranslation } from "react-i18next";
import FinancialReport from "./hall_owner/FinancialReport";
import "./Dashboard.css";

// Import Font Awesome icons
import {
  FaUserEdit,
  FaCalendarAlt,
  FaPlusSquare,
  FaHome,
  FaUsers,
  FaTrashAlt,
  FaFileInvoiceDollar,
  FaCog,
} from "react-icons/fa";

const Dashboard = () => {
  const { path, url } = useRouteMatch();
  const { t } = useTranslation();
  const history = useHistory();
  const { isLoggedIn, loading } = useAuth(); // Get isLoggedIn and loading state

  const userRole = localStorage.getItem("role"); // Get user role from localStorage

  const [hallsToProcessCount, setHallsToProcessCount] = useState(0); // State for halls needing processing

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      history.push("/unauthorized");
    }
  }, [isLoggedIn, loading, history]);

  useEffect(() => {
    if (userRole === "ADMIN") {
      // Fetch count of halls needing processing
      const fetchHallsToProcess = async () => {
        try {
          const response = await fetch(
            "http://localhost:8080/admin/getAllHallIsProcessed?page=1&size=10",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setHallsToProcessCount(data.totalElements || 0);
          } else {
            console.error("Failed to fetch halls to process");
          }
        } catch (error) {
          console.error("Error fetching halls to process:", error);
        }
      };

      fetchHallsToProcess();
    }
  }, [userRole]);

  if (loading) {
    return <div>Loading...</div>; // Loading spinner or message
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <ul className="links-container">
          {/* Edit Profile */}
          <li className="nav-item nav-edit-profile">
            <NavLink to={`${url}/edit-profile`} className="nav-link">
              <FaUserEdit /> {t("edit_profile")}
            </NavLink>
          </li>

          {/* CUSTOMER Role */}
          {userRole === "CUSTOMER" && (
            <li className="nav-item">
              <NavLink to={`${url}/reserved-halls`} className="nav-link">
                <FaCalendarAlt /> {t("reserved_halls")}
              </NavLink>
            </li>
          )}

          {/* HALL OWNER Role */}
          {userRole === "HALL_OWNER" && (
            <>
              <li className="nav-item">
                <NavLink to={`${url}/reserved-halls`} className="nav-link">
                  <FaCalendarAlt /> {t("reserved_halls")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/add-new-hall`} className="nav-link">
                  <FaPlusSquare /> {t("add_new_hall")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/my-halls`} className="nav-link">
                  <FaHome /> {t("my_halls")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/deleted-halls`} className="nav-link">
                  <FaTrashAlt /> {t("deleted_halls")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/financial-report`} className="nav-link">
                  <FaFileInvoiceDollar /> {t("financial_report")}
                </NavLink>
              </li>
            </>
          )}

          {/* ADMIN Role */}
          {userRole === "ADMIN" && (
            <>
              <li className="nav-item">
                <NavLink to={`${url}/all-users`} className="nav-link">
                  <FaUsers /> {t("all_users")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/procces-halls`} className="nav-link">
                  <FaCog /> {t("Process_halls")}{" "}
                  {hallsToProcessCount > 0 && (
                    <span className="notification-circle">
                      {hallsToProcessCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/deleted-user`} className="nav-link">
                  <FaTrashAlt /> {t("deleted_user")}
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="dashboard-content">
        <Switch>
          <Route path={`${path}/edit-profile`} component={EditProfile} />

          {/* CUSTOMER-Specific Protected Route */}
          <ProtectedRoute
            path={`${path}/reserved-halls`}
            component={ReservedHalls}
            allowedRoles={["CUSTOMER", "HALL_OWNER"]} // Allow both CUSTOMER and HALL_OWNER
          />

          {/* HALL_OWNER-Specific Protected Routes */}
          <ProtectedRoute
            path={`${path}/add-new-hall`}
            component={AddNewHall}
            allowedRoles={["HALL_OWNER"]}
          />
          <ProtectedRoute
            path={`${path}/my-halls`}
            component={MyHalls}
            allowedRoles={["HALL_OWNER"]}
          />
          <ProtectedRoute
            path={`${path}/deleted-halls`}
            component={DeletedHalls}
            allowedRoles={["HALL_OWNER"]}
          />
          <ProtectedRoute
            path={`${path}/update-hall/:hallId`}
            component={UpdateHallPage}
            allowedRoles={["HALL_OWNER"]}
          />
          <ProtectedRoute
            path={`${path}/financial-report`}
            component={FinancialReport}
            allowedRoles={["HALL_OWNER"]}
          />

          {/* ADMIN-Specific Protected Routes */}
          <ProtectedRoute
            path={`${path}/all-users`}
            component={AllUsers}
            allowedRoles={["ADMIN"]}
          />
          <ProtectedRoute
            path={`${path}/procces-halls`}
            component={ProcessHalls}
            allowedRoles={["ADMIN"]}
          />
          <ProtectedRoute
            path={`${path}/deleted-user`}
            component={DeletedUser}
            allowedRoles={["ADMIN"]}
          />
        </Switch>
      </div>
    </div>
  );
};

export default Dashboard;
