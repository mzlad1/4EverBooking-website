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
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

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
  const [email, setEmail] = useState(""); // For email search
  const [debouncedEmail, setDebouncedEmail] = useState(""); // For the API call

  const [role, setRole] = useState(""); // For role filter
  const pageSize = 10;

  // Debounce effect for email input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(email); // Update the debounced email after delay
    }, 500); // 500ms delay

    return () => clearTimeout(handler); // Cleanup on each new keystroke
  }, [email]);

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Construct query parameters
        const queryParams = new URLSearchParams({
          page,
          size: pageSize,
          ...(role && { role }),
          ...(debouncedEmail && { email: debouncedEmail }),
        });

        const response = await fetchWithAuth(
          `http://localhost:8080/admin/users?${queryParams.toString()}`,
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
  }, [page, role, debouncedEmail]);

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

      {/* Search and Filter Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <TextField
          label={t("search_by_email")}
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: "10px", flex: 1 }}
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          displayEmpty
          variant="outlined"
          style={{ flex: 1 }}
        >
          <MenuItem value="">all roles</MenuItem>
          <MenuItem value="CUSTOMER">Customer</MenuItem>
          <MenuItem value="HALL_OWNER">Hall owner</MenuItem>
          <MenuItem value="ADMIN">Admin</MenuItem>
          <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
        </Select>
      </div>

      {users.length === 0 ? (
        <p>{t("no_users")}</p>
      ) : (
        <>
          {/* Users Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("user_id")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("email")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("phone")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("role")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
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
                      {localStorage.getItem("role") === "SUPER_ADMIN" && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleOpenDialog(user)}
                        >
                          {t("delete")}
                        </Button>
                      )}
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
        <DialogTitle
          style={{
            backgroundColor: "#cba36b",
            color: "white",
            fontSize: "1.5rem",
            textAlign: "center",
            padding: "16px",
          }}
        >
          {t("user_details")}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            backgroundColor: "#f9f9f9",
            maxWidth: "800px", // Increased the width of the page
            margin: "0 auto", // Center the content
          }}
        >
          {userDetails ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "1rem",
                color: "#333",
              }}
            >
              <div style={{ display: "flex", justifyContent: "start" }}>
                <span style={{ fontWeight: "bold" }}>{t("user_id")}:</span>
                <span>{userDetails.id}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "start" }}>
                <span style={{ fontWeight: "bold" }}>{t("name")}:</span>
                <span>
                  {userDetails.firstName} {userDetails.lastName}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "start" }}>
                <span style={{ fontWeight: "bold" }}>{t("phone")}:</span>
                <span>{userDetails.phone}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "start" }}>
                <span style={{ fontWeight: "bold" }}>{t("email")}:</span>
                <span>{userDetails.email}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "start" }}>
                <span style={{ fontWeight: "bold" }}>{t("address")}:</span>
                <span>{userDetails.address}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "start" }}>
                <span style={{ fontWeight: "bold" }}>
                  {t("date_of_birth")}:
                </span>
                <span>
                  {new Date(userDetails.dateOfBirth).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "start" }}>
                <span style={{ fontWeight: "bold" }}>{t("role")}:</span>
                <span>{userDetails.role}</span>
              </div>
            </div>
          ) : (
            <p
              style={{
                fontSize: "1.2rem",
                color: "#666",
                textAlign: "center",
              }}
            >
              {t("loading_user_details")}
            </p>
          )}
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#f1f1f1",
            padding: "16px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => setUserDetails(null)}
            style={{
              backgroundColor: "#cba36b",
              color: "white",
              padding: "10px 20px",
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "uppercase",
            }}
          >
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AllUsers;
