import React, { useState, useEffect } from "react";
import { useRouteMatch, useHistory } from "react-router-dom"; // Import necessary hooks
import { useTranslation } from "react-i18next"; // i18n for translation
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
import Pagination from "@mui/material/Pagination"; // Import Pagination component
import "./MyHalls.css"; // CSS for styling the halls page
import { fetchWithAuth } from "../../../apiClient"; // Import the fetchWithAuth function

const MyHalls = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const history = useHistory(); // Initialize navigation hook
  const [selectedHall, setSelectedHall] = useState(null); // For storing the selected hall for deletion
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility
  const { url } = useRouteMatch(); // This gives you the base URL

  const fetchHalls = async (page) => {
    try {
      const token = localStorage.getItem("accessToken");
      const ownerId = localStorage.getItem("hallOwnerId");

      const apiUrl = `http://localhost:8080/hallOwner/getAll?ownerId=${ownerId}&page=${page}&size=12`;

      const response = await fetchWithAuth(apiUrl, {
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

      const response = await fetchWithAuth(deleteUrl, {
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

      const updatedHalls = halls.filter((hall) => hall.id !== hallId);
      if (updatedHalls.length < 12 && currentPage < totalPages) {
        fetchHalls(currentPage); // Fetch updated halls
      } else {
        setHalls(updatedHalls);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateHall = (hallId) => {
    history.push(`update-hall/${hallId}`); // Navigate to the update hall page
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
          <Card key={hall.id} className="myhall-card-modern">
            <CardMedia
              component="img"
              height="140"
              image={getValidImage(hall.image)}
              alt={hall.name}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {hall.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("location")}: {t(`west_bank_cities.${hall.location}`)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("capacity")}: {hall.capacity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("average_rating")}: {hall.averageRating.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("phone")}: {hall.phone}
              </Typography>
              <div className="hall-actions-modern">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateHall(hall.id)}
                  style={{ marginRight: "10px" }}
                >
                  {t("update_hall")}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleOpenDialog(hall)}
                >
                  {t("delete_hall")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-modern">
        <Pagination
          count={totalPages} // Total number of pages
          page={currentPage} // Current page
          variant="outlined"
          onChange={(event, value) => setCurrentPage(value)} // Handle page change
          color="primary"
        />
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
