import React, { useState, useEffect } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import "./MyHalls.css";
import { fetchWithAuth } from "../../../apiClient";

const MyHalls = () => {
  const { t } = useTranslation();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeedbacks, setSelectedFeedbacks] = useState([]); // Store feedbacks for selected hall
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false); // Manage feedback dialog visibility
  const [selectedHall, setSelectedHall] = useState(null); // Store selected hall for deletion
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Manage delete dialog visibility
  const history = useHistory();
  const { url } = useRouteMatch();

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

  const handleOpenFeedbackDialog = (feedbacks) => {
    setSelectedFeedbacks(feedbacks);
    setOpenFeedbackDialog(true);
  };

  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
    setSelectedFeedbacks([]);
  };

  const handleOpenDeleteDialog = (hallId) => {
    setSelectedHall(hallId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedHall(null);
  };

  const handleDeleteHall = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const ownerId = localStorage.getItem("hallOwnerId");
      const deleteUrl = `http://localhost:8080/hallOwner/delete?id=${selectedHall}&ownerId=${ownerId}`;

      const response = await fetchWithAuth(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      if (!response.ok) throw new Error(t("failed_to_delete_hall"));

      setHalls(halls.filter((hall) => hall.id !== selectedHall));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleUpdateHall = (hallId) => {
    history.push(`update-hall/${hallId}`); // Navigate to the update hall page
  };

  useEffect(() => {
    fetchHalls(currentPage);
  }, [currentPage]);

  if (loading) return <p>{t("loading")}</p>;
  if (error)
    return (
      <p>
        {t("error")}: {error}
      </p>
    );

  return (
    <div className="my-halls-container-modern">
      <h1 className="my-halls-title">{t("my_halls")}</h1>
      <div className="halls-list-modern">
        {halls.map((hall) => (
          <Card key={hall.id} className="myhall-card-modern">
            <CardMedia
              component="img"
              height="140"
              image={hall.image.split(",")[0]} // Use the first image
              alt={hall.name}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {hall.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("location")}: {hall.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("capacity")}: {hall.capacity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("average_rating")}: {hall.averageRating?.toFixed(2)}
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
                  color="secondary"
                  onClick={() => handleOpenFeedbackDialog(hall.HallRatings)}
                  style={{ marginRight: "10px" }}
                >
                  {t("feedbacks")}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleOpenDeleteDialog(hall.id)}
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
          count={totalPages}
          page={currentPage}
          variant="outlined"
          onChange={(event, value) => setCurrentPage(value)}
          color="primary"
        />
      </div>

      {/* Feedbacks Dialog */}
      <Dialog
        open={openFeedbackDialog}
        onClose={handleCloseFeedbackDialog}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxWidth: "800px" } }} // Inline styling for width
        className="feedback-dialog"
      >
        <DialogTitle className="feedback-dialog-title">
          {t("hall_feedbacks")}
        </DialogTitle>
        <DialogContent className="feedback-dialog-content">
          {selectedFeedbacks.length > 0 ? (
            selectedFeedbacks.map((feedback) => (
              <div key={feedback.id} className="feedback-dialog-item">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="feedback-dialog-rating"
                >
                  {t("rating")}: {feedback.rating}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="feedback-dialog-comment"
                >
                  {t("comment")}: {feedback.comment}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="feedback-dialog-date"
                >
                  {t("date")}: {new Date(feedback.createdDate).toLocaleString()}
                </Typography>
                <hr className="feedback-dialog-separator" />
              </div>
            ))
          ) : (
            <Typography className="feedback-dialog-no-feedbacks">
              {t("no_feedbacks")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions className="feedback-dialog-actions">
          <Button onClick={handleCloseFeedbackDialog} color="primary">
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t("confirm_delete")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("are_you_sure_you_want_to_delete_this_hall")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={handleDeleteHall} color="error">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MyHalls;
