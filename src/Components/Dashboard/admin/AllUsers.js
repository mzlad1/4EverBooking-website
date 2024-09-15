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

const AllUsers = () => {
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
      <h1>All Users</h1>

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <>
          {/* Users Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>ID</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Phone</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Role</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Actions</TableCell>
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
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(user)}
                      >
                        Delete
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{selectedUser?.email}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!userDetails} onClose={() => setUserDetails(null)}>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {userDetails ? (
            <>
              <p>
                <strong>ID:</strong> {userDetails.id}
              </p>
              <p>
                <strong>Name:</strong> {userDetails.firstName}{" "}
                {userDetails.lastName}
              </p>
              <p>
                <strong>Phone:</strong> {userDetails.phone}
              </p>
              <p>
                <strong>Email:</strong> {userDetails.email}
              </p>
              <p>
                <strong>Address:</strong> {userDetails.address}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(userDetails.dateOfBirth).toLocaleDateString()}
              </p>
              <p>
                <strong>Role:</strong> {userDetails.role}
              </p>

              {/* User Ratings Section */}
              <h3>User Ratings</h3>
              {userDetails.userHallRatings.length > 0 ? (
                <ul>
                  {userDetails.userHallRatings.map((rating) => (
                    <li key={rating.id}>
                      <p>
                        <strong>Rating:</strong> {rating.rating}
                      </p>
                      <p>
                        <strong>Comment:</strong> {rating.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No ratings available</p>
              )}
            </>
          ) : (
            <p>Loading user details...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetails(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AllUsers;
