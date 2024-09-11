import React, { useState, useEffect } from "react";
import "./MyHalls.css"; // CSS for styling the halls page
import { useTranslation } from "react-i18next"; // i18n for translation
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const MyHalls = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedHall, setSelectedHall] = useState(null); // For storing the selected hall for deletion
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility

  const fetchHalls = async (page) => {
    try {
      const token = localStorage.getItem("accessToken");
      const ownerId = localStorage.getItem("hallOwnerId");

      const apiUrl = `http://localhost:8080/hallOwner/getAll?ownerId=${ownerId}&page=${page}&size=12`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(t("failed_to_fetch_halls"));
      }

      const data = await response.json();
      setHalls(data.content);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Check if the URL is a video
  const isVideo = (url) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  // Get valid image URL
  const getValidImage = (imageUrls) => {
    const images = imageUrls.split(",");
    if (isVideo(images[0])) {
      return images[1] ? images[1] : "/default-placeholder.jpg"; // If the second one is valid, use it, otherwise show a placeholder
    }
    return images[0]; // If the first is not a video, use it
  };

  useEffect(() => {
    fetchHalls(currentPage); // Fetch halls when component mounts or page changes
  }, [currentPage]);

  if (loading) return <p>{t("loading")}</p>; // Translated loading message
  if (error)
    return (
      <p>
        {t("error")}: {error}
      </p>
    ); // Translated error message

  // Function to handle hall deletion
  const handleDeleteHall = async (hallId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const ownerId = localStorage.getItem("hallOwnerId");

      const deleteUrl = `http://localhost:8080/hallOwner/?id=${hallId}&OwnerId=${ownerId}`;

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      const data = await response.json(); // Parse the response
      if (!response.ok) {
        throw new Error(t("failed_to_delete_hall"));
      }

      // Display the response message
      alert(data.message); // This will show the message "Hall deleted successfully"

      // Continue with the rest of the deletion logic...
      const updatedHalls = halls.filter((hall) => hall.id !== hallId);
      if (updatedHalls.length < 12 && currentPage < totalPages) {
        // Fetch next page halls if needed
        // Fetch logic remains the same
      } else {
        setHalls(updatedHalls);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateHall = (hallId) => {
    console.log("Update Hall: ", hallId);
    // Add logic to update the hall
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedHall(null);
  };

  const handleOpenDialog = (hall) => {
    setSelectedHall(hall);
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    handleDeleteHall(selectedHall.id);
    handleDialogClose();
  };

  return (
    <div className="my-halls-container-modern">
      <h1 className="my-halls-title">{t("my_halls")}</h1>
      <div className="halls-list-modern">
        {halls.map((hall) => (
          <div key={hall.id} className="myhall-card-modern">
            <img
              src={getValidImage(hall.image)}
              alt={hall.name}
              className="hall-image-modern"
            />
            <div className="hall-info-modern">
              <h2 className="hall-name-modern">{hall.name}</h2>
              <p className="hall-location-modern">
                {t("location")}: {t(`west_bank_cities.${hall.location}`)}
              </p>
              <p className="hall-capacity-modern">
                {t("capacity")}: {hall.capacity}
              </p>
              <p className="hall-rating-modern">
                {t("average_rating")}: {hall.averageRating}
              </p>
              <p className="hall-phone-modern">
                {t("phone")}: {hall.phone}
              </p>
              {/* Update and Delete Buttons */}
              <div className="hall-actions-modern">
                <button
                  className="button-update-modern"
                  onClick={() => handleUpdateHall(hall.id)}
                >
                  {t("update_hall")}
                </button>
                <button
                  className="button-delete-modern"
                  onClick={() => handleOpenDialog(hall)}
                >
                  {t("delete_hall")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      <div className="pagination-modern">
        <button
          className="pagination-button-modern"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          {t("previous")}
        </button>
        <span className="pagination-info-modern">
          {t("page")} {currentPage} {t("of")} {totalPages}
        </span>
        <button
          className="pagination-button-modern"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        >
          {t("next")}
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("are_you_sure_you_want_to_delete_this_hall")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MyHalls;
