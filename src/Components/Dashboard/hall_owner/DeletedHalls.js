import React, { useEffect, useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import "./DeletedHalls.css";

const DeletedHallsPage = () => {
  const [deletedHalls, setDeletedHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [hallToRestore, setHallToRestore] = useState(null);

  const accessToken = localStorage.getItem("accessToken");
  const hallOwnerId = localStorage.getItem("hallOwnerId");

  // Fetch deleted halls
  const fetchDeletedHalls = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/hallOwner/getDeletedHallsByHallOwner?page=${page}&size=10&hallOwnerId=${hallOwnerId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "*/*",
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
      const response = await fetch(
        `http://localhost:8080/hallOwner/restoreHall?id=${hallToRestore.id}&ownerId=${hallOwnerId}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "*/*",
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return <p>Loading deleted halls...</p>;
  }

  return (
    <div className="deleted-halls-page-unique">
      <h1 className="deleted-halls-title-unique">Deleted Halls</h1>

      {deletedHalls.length === 0 ? (
        <p className="deleted-halls-no-halls-unique">No deleted halls found.</p>
      ) : (
        <div className="deleted-halls-container-unique">
          {deletedHalls.map((hall) => (
            <div key={hall.id} className="deleted-hall-card-unique">
              <img src={hall.image.split(",")[0]} alt={hall.name} className="deleted-hall-image-unique" />
              <h2 className="deleted-hall-name-unique">{hall.name}</h2>
              <p className="deleted-hall-info-unique"><strong>Location:</strong> {hall.location}</p>
              <p className="deleted-hall-info-unique"><strong>Capacity:</strong> {hall.capacity}</p>
              <p className="deleted-hall-info-unique"><strong>Description:</strong> {hall.description}</p>
              <p className="deleted-hall-info-unique"><strong>Phone:</strong> {hall.phone}</p>
              <p className="deleted-hall-info-unique"><strong>Average Rating:</strong> {hall.averageRating}</p>
              <button
                className="restore-hall-button-unique"
                onClick={() => openRestoreDialog(hall)}
              >
                Restore Hall
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="deleted-halls-pagination-controls-unique">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`pagination-button-unique ${page === index + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={closeDialog}
        aria-labelledby="confirm-restore-dialog"
      >
        <DialogTitle id="confirm-restore-dialog">Restore Hall</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore the hall "{hallToRestore?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={restoreHall} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeletedHallsPage;
