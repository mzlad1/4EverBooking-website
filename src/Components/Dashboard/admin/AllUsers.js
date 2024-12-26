import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../apiClient";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTranslation } from "react-i18next"; // Import useTranslation


const AllUsers = () => {
  const { t } = useTranslation(); // Initialize translation hook

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null); // For storing the selected user's full details
  const pageSize = 10;

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(
          `http://localhost:8080/admin/users?page=${page}&size=${pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.content); // Set the users data
        setTotalPages(data.totalPages); // Set total pages
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  // Open delete confirmation dialog
  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  // Handle delete user
  const handleDelete = async () => {
    setOpenDialog(false); // Close the dialog

    if (!selectedUser) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/admin/deleteUser/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Optionally update the UI by removing the deleted user
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id)
      );
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch full user details and show dialog for user info
  const handleViewDetails = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/admin/getUser/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userDetails = await response.json();
      setUserDetails(userDetails);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle page change in pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div
      className="all-users-container"
      style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <h1>{t("all_users")}</h1>
  
      {users.length === 0 ? (
        <p>{t("no_users")}</p>
      ) : (
        <>
          {/* Users Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                    {t("user_id")}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                    {t("email")}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                    {t("phone")}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                    {t("role")}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                    {t("actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleViewDetails(user.id)}
                        style={{ marginRight: "10px" }}
                      >
                        {t("view_details")}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(user)}
                      >
                        {t("delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
  
          {/* Pagination */}
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          />
        </>
      )}
  
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("delete_confirmation", { email: selectedUser?.email })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={handleDelete} color="secondary">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
  
      {/* User Details Dialog */}
      <Dialog open={!!userDetails} onClose={() => setUserDetails(null)}>
        <DialogTitle>{t("user_details")}</DialogTitle>
        <DialogContent>
          {userDetails ? (
            <>
              <p>
                <strong>{t("user_id")}:</strong> {userDetails.id}
              </p>
              <p>
                <strong>{t("name")}:</strong> {userDetails.firstName}{" "}
                {userDetails.lastName}
              </p>
              <p>
                <strong>{t("phone")}:</strong> {userDetails.phone}
              </p>
              <p>
                <strong>{t("email")}:</strong> {userDetails.email}
              </p>
              <p>
                <strong>{t("address")}:</strong> {userDetails.address}
              </p>
              <p>
                <strong>{t("date_of_birth")}:</strong>{" "}
                {new Date(userDetails.dateOfBirth).toLocaleDateString()}
              </p>
              <p>
                <strong>{t("role")}:</strong> {userDetails.role}
              </p>
  
              {/* User Ratings Section */}
              <h3>{t("user_ratings")}</h3>
              {userDetails.userHallRatings.length > 0 ? (
                <ul>
                  {userDetails.userHallRatings.map((rating) => (
                    <li key={rating.id}>
                      <p>
                        <strong>{t("rating")}:</strong> {rating.rating}
                      </p>
                      <p>
                        <strong>{t("comment")}:</strong> {rating.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t("no_ratings")}</p>
              )}
            </>
          ) : (
            <p>{t("loading_user_details")}</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetails(null)} color="primary">
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  
};

export default AllUsers;
