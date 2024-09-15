import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination"; // Material-UI pagination
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import { fetchWithAuth } from "../../../apiClient"; // Import the fetchWithAuth function
import "./DeletedHalls.css";

const DeletedHallsPage = () => {
  const [deletedHalls, setDeletedHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [hallToRestore, setHallToRestore] = useState(null);
  const { t } = useTranslation(); // Initialize translation hook
  const accessToken = localStorage.getItem("accessToken");
  const hallOwnerId = localStorage.getItem("hallOwnerId");

  // Fetch deleted halls
  const fetchDeletedHalls = async (page) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/hallOwner/getDeletedHallsByHallOwner?page=${page}&size=10&hallOwnerId=${hallOwnerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "*/*",
          },
        }
      );

      const data = await response.json();
      setDeletedHalls(data.content);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch deleted halls:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedHalls(page);
  }, [page]);

  // Open confirmation dialog
  const openRestoreDialog = (hall) => {
    setHallToRestore(hall);
    setOpenDialog(true);
  };

  // Close the dialog
  const closeDialog = () => {
    setOpenDialog(false);
    setHallToRestore(null);
  };

  // Restore hall
  const restoreHall = async () => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/hallOwner/restoreHall?id=${hallToRestore.id}&ownerId=${hallOwnerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "*/*",
          },
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        // Refresh the deleted halls list
        fetchDeletedHalls(page);
        closeDialog();
      } else {
        alert("Failed to restore hall");
      }
    } catch (error) {
      console.error("Error restoring hall:", error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return <p>{t("loading_deleted_halls")}</p>;
  }

  return (
    <div className="deleted-halls-page-unique">
      <Typography variant="h4" align="center" gutterBottom>
        {t("deleted_halls")}
      </Typography>

      {deletedHalls.length === 0 ? (
        <Typography variant="body1" align="center" color="textSecondary">
          {t("no_deleted_halls_found")}
        </Typography>
      ) : (
        <div className="deleted-halls-container-unique">
          {deletedHalls.map((hall) => (
            <Card key={hall.id} className="deleted-hall-card-unique">
              <CardMedia
                component="img"
                height="140"
                image={hall.image.split(",")[0]}
                alt={hall.name}
              />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {hall.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>{t("location")}:</strong> {hall.location}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>{t("capacity")}:</strong> {hall.capacity}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>{t("description")}:</strong> {hall.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>{t("phone")}:</strong> {hall.phone}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>{t("average_rating")}:</strong> {hall.averageRating}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => openRestoreDialog(hall)}
                  style={{ marginTop: "10px" }}
                >
                  {t("restore_hall")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
        className="deleted-halls-pagination-controls-unique"
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        aria-labelledby="confirm-restore-dialog"
      >
        <DialogTitle id="confirm-restore-dialog">
          {t("restore_hall")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("are_you_sure_you_want_to_restore_this_hall")} "{hallToRestore?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={restoreHall} color="secondary" autoFocus>
            {t("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeletedHallsPage;
