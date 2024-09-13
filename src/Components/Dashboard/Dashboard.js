import React from "react";
import { NavLink, Route, Switch, useRouteMatch } from "react-router-dom";
import EditProfile from "./EditProfile";
import ReservedHalls from "./reservedHalls";
import AddNewHall from "./hall_owner/AddNewHall"; // AddNewHall component for hall owners
import MyHalls from "./hall_owner/MyHalls"; // MyHalls component for hall owners
import UpdateHallPage from "./hall_owner/updateHall"; // updateHall component for hall owners
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
          <li className="nav-item nav-edit-profile">
            <NavLink to={`${url}/edit-profile`} className="nav-link">
              {t("edit_profile")}
            </NavLink>
          </li>

          {userRole === "CUSTOMER" && (
            <li className="nav-item">
              <NavLink to={`${url}/reserved-halls`} className="nav-link">
                {t("reserved_halls")}
              </NavLink>
            </li>
          )}

          {userRole === "HALL_OWNER" && (
            <>
              <li className="nav-item">
                <NavLink to={`${url}/reserved-halls`} className="nav-link">
                  {t("reserved_halls")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/add-new-hall`} className="nav-link">
                  {t("add_new_hall")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/my-halls`} className="nav-link">
                  {t("my_halls")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/deleted-halls`} className="nav-link">
                  {t("deleted_halls")}
                </NavLink>
              </li>
            </>
          )}

          {userRole === "ADMIN" && (
            <>
              <li className="nav-item">
                <NavLink to={`${url}/all-users`} className="nav-link">
                  {t("all_users")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/add-new-admin`} className="nav-link">
                  {t("add_new_admin")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`${url}/delete-user`} className="nav-link">
                  {t("delete_user")}
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="dashboard-content">
        <Switch>
          <Route
            path={`${path}/edit-profile`}
            component={EditProfile}
            allowedRoles={["CUSTOMER", "HALL_OWNER", "ADMIN"]} // Pass allowedRoles explicitly here
          />
          {userRole === "CUSTOMER" && (
            <Route
              path={`${path}/reserved-halls`}
              component={ReservedHalls}
              allowedRoles={["CUSTOMER"]} // Only CUSTOMER can access this route
            />
          )}

          {userRole === "HALL_OWNER" && (
            <>
              <Route
                path={`${path}/update-hall/:hallId`}
                component={UpdateHallPage}
              />

              <Route
                path={`${path}/reserved-halls`}
                component={ReservedHalls}
                allowedRoles={["HALL_OWNER"]} // Only HALL_OWNER can access this route
              />
              <Route
                path={`${path}/add-new-hall`}
                component={AddNewHall}
                allowedRoles={["HALL_OWNER"]} // Only HALL_OWNER can access this route
              />
              <Route
                path={`${path}/my-halls`}
                component={MyHalls}
                allowedRoles={["HALL_OWNER"]} // Only HALL_OWNER can access this route
              />
              <Route path={`${path}/deleted-halls`} component={DeletedHalls} />
            </>
          )}

          {userRole === "ADMIN" && (
            <>
              <Route
                path={`${path}/all-users`}
                component={AllUsers}
                allowedRoles={["ADMIN"]} // Only ADMIN can access this route
              />
              <Route
                path={`${path}/add-new-admin`}
                component={AddNewAdmin}
                allowedRoles={["ADMIN"]} // Only ADMIN can access this route
              />
              <Route
                path={`${path}/delete-user`}
                component={DeleteUser}
                allowedRoles={["ADMIN"]} // Only ADMIN can access this route
              />
            </>
          )}
        </Switch>
      </div>
    </div>
  );
};

export default Dashboard;
