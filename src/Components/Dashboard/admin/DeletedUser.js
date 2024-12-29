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

const DeletedUsers = () => {
  const { t } = useTranslation(); // Initialize translation hook

  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const pageSize = 10;

  // Fetch deleted users from the API
  useEffect(() => {
    const fetchDeletedUsers = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(
          `http://localhost:8080/admin/DeletedUsers?page=${page}&size=${pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch deleted users");
        }

        const data = await response.json();
        setDeletedUsers(data.content); // Set the deleted users data
        setTotalPages(data.totalPages); // Set total pages
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedUsers();
  }, [page]);

  // Open restore confirmation dialog
  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  // Handle restore user
  const handleRestore = async () => {
    setOpenDialog(false); // Close the dialog

    if (!selectedUser) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/admin/restoreUser/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to restore user");
      }

      // Optionally update the UI by removing the restored user
      setDeletedUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id)
      );
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle page change in pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return <p>Loading deleted users...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div
      className="deleted-users-container"
      style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <h1>{t("deleted_user")}</h1>

      {deletedUsers.length === 0 ? (
        <p>{t("no_deleted_users")}</p>
      ) : (
        <>
          {/* Deleted Users Table */}
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
                    {t("name")}
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
                {deletedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.firstName + " " + user.lastName}
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleOpenDialog(user)}
                      >
                        {t("restore")}
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

      {/* Restore Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("confirm_restore")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("restore_confirmation", { email: selectedUser?.email })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={handleRestore} color="success">
            {t("restore")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeletedUsers;
