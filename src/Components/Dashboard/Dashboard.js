import React from "react";
import { NavLink, Route, Switch, useRouteMatch } from "react-router-dom";
import EditProfile from "./EditProfile";
import ReservedHalls from "./reservedHalls";
import AddNewHall from "./hall_owner/AddNewHall"; // AddNewHall component for hall owners
import MyHalls from "./hall_owner/MyHalls"; // MyHalls component for hall owners
import AllUsers from "./admin/AllUsers"; // AllUsers component for admins
import AddNewAdmin from "./admin/AddNewAdmin"; // AddNewAdmin component for admins
import DeleteUser from "./admin/DeleteUser"; // DeleteUser component for admins
import DeletedHalls from "./hall_owner/DeletedHalls"; // DeletedHalls component for hall owners
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import "./Dashboard.css";

const Dashboard = () => {
  const { path, url } = useRouteMatch();
  const { t } = useTranslation(); // Initialize translation hook

  const userRole = localStorage.getItem("role"); // Retrieve user role from localStorage

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <ul className="links-container">
          {/* Common link for all roles */}
          <li className="nav-item nav-edit-profile">
            <NavLink
              to={`${url}/edit-profile`}
              className={`nav-link edit-profile-link ${({
                isActive,
                isPending,
              }) => (isPending ? "pending" : isActive ? "active" : "")}`}
            >
              {t("edit_profile")} {/* Translated "Edit Profile" */}
            </NavLink>
          </li>

          {/* Conditional links based on user role */}
          {userRole === "CUSTOMER" && (
            <li className="nav-item nav-reserved-halls-customer">
              <NavLink
                to={`${url}/reserved-halls`}
                className={`nav-link reserved-halls-link-customer ${({
                  isActive,
                  isPending,
                }) => (isPending ? "pending" : isActive ? "active" : "")}`}
              >
                {t("reserved_halls")} {/* Translated "Reserved Halls" */}
              </NavLink>
            </li>
          )}

          {userRole === "HALL_OWNER" && (
            <>
              <li className="nav-item nav-reserved-halls-owner">
                <NavLink
                  to={`${url}/reserved-halls`}
                  className={`nav-link reserved-halls-link-owner ${({
                    isActive,
                    isPending,
                  }) => (isPending ? "pending" : isActive ? "active" : "")}`}
                >
                  {t("reserved_halls")} {/* Translated "Reserved Halls" */}
                </NavLink>
              </li>
              <li className="nav-item nav-add-new-hall">
                <NavLink
                  to={`${url}/add-new-hall`}
                  className={`nav-link add-new-hall-link ${({
                    isActive,
                    isPending,
                  }) => (isPending ? "pending" : isActive ? "active" : "")}`}
                >
                  {t("add_new_hall")} {/* Translated "Add New Hall" */}
                </NavLink>
              </li>
              <li className="nav-item nav-my-halls">
                <NavLink
                  to={`${url}/my-halls`}
                  className={`nav-link my-halls-link ${({
                    isActive,
                    isPending,
                  }) => (isPending ? "pending" : isActive ? "active" : "")}`}
                >
                  {t("my_halls")} {/* Translated "My Halls" */}
                </NavLink>
              </li>
              <li className="nav-item nav-deleted-halls">
                <NavLink
                  to={`${url}/deleted-halls`}
                  className={`nav-link my-halls-link ${({
                    isActive,
                    isPending,
                  }) => (isPending ? "pending" : isActive ? "active" : "")}`}
                >
                  {t("deleted_halls")} {/* Translated "My Halls" */}
                </NavLink>
              </li>
            </>
          )}

          {userRole === "ADMIN" && (
            <>
              <li className="nav-item nav-all-users">
                <NavLink
                  to={`${url}/all-users`}
                  className={`nav-link all-users-link ${({
                    isActive,
                    isPending,
                  }) => (isPending ? "pending" : isActive ? "active" : "")}`}
                >
                  {t("all_users")} {/* Translated "All Users" */}
                </NavLink>
              </li>
              <li className="nav-item nav-add-new-admin">
                <NavLink
                  to={`${url}/add-new-admin`}
                  className={`nav-link add-new-admin-link ${({
                    isActive,
                    isPending,
                  }) => (isPending ? "pending" : isActive ? "active" : "")}`}
                >
                  {t("add_new_admin")} {/* Translated "Add New Admin" */}
                </NavLink>
              </li>
              <li className="nav-item nav-delete-user">
                <NavLink
                  to={`${url}/delete-user`}
                  className={`nav-link delete-user-link ${({
                    isActive,
                    isPending,
                  }) => (isPending ? "pending" : isActive ? "active" : "")}`}
                >
                  {t("delete_user")} {/* Translated "Delete User" */}
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className="dashboard-content">
        <Switch>
          <Route path={`${path}/edit-profile`} component={EditProfile} />
          {userRole === "CUSTOMER" && (
            <Route path={`${path}/reserved-halls`} component={ReservedHalls} />
          )}

          {userRole === "HALL_OWNER" && (
            <>
              <Route
                path={`${path}/reserved-halls`}
                component={ReservedHalls}
              />
              <Route path={`${path}/add-new-hall`} component={AddNewHall} />
              <Route path={`${path}/my-halls`} component={MyHalls} />
              <Route path={`${path}/deleted-halls`} component={DeletedHalls} />
            </>
          )}

          {userRole === "ADMIN" && (
            <>
              <Route path={`${path}/all-users`} component={AllUsers} />
              <Route path={`${path}/add-new-admin`} component={AddNewAdmin} />
              <Route path={`${path}/delete-user`} component={DeleteUser} />
            </>
          )}

          {/* Add more routes for other options if needed */}
        </Switch>
      </div>
    </div>
  );
};

export default Dashboard;
