import React, { useState, useEffect } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import "./FeedbackPage.css";
import { fetchWithAuth } from "../../apiClient";
import { Rating } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";

const FeedbackPage = () => {
  const { hallId } = useParams();
  const parsedHallId = Number(hallId);
  const history = useHistory();
  const userId = Number(localStorage.getItem("userId"));
  const location = useLocation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const { reservationId } = location.state || {};
    if (!reservationId) {
      history.replace("/unauthorized"); // Redirect if reservationId is missing
    }
  }, [location.state, history]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { reservationId } = location.state || {};
    if (!reservationId) {
      history.replace("/unauthorized");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError("Please provide a rating between 1 and 5 stars.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        userId,
        hallId: parsedHallId,
        reservationId, // Include reservationId
        rating,
        comment,
      };

      const response = await fetchWithAuth(
        "http://localhost:8080/customer/rateHall",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit feedback. Please try again later.");
      }

      setOpenDialog(true); // Open success dialog
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    history.replace("/dashboard/reserved-halls", {}); // Redirect back to Reserved Halls and clear state
  };

  return (
    <Container className="feedback-container" maxWidth="sm">
      <Typography variant="h4" gutterBottom className="feedback-title">
        Leave Feedback
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="rating-section">
          <Typography variant="h6" className="rating-label">
            Rating:
          </Typography>
          <Rating
            name="rating"
            value={rating}
            precision={1}
            onChange={(event, newValue) => setRating(newValue)}
            sx={{
              "& .MuiRating-iconFilled": { color: "#CBA36B" }, // Set filled stars color
              "& .MuiRating-iconHover": { color: "#A97C50" }, // Set hover color
            }}
          />
        </div>

        <div className="comment-section">
          <Typography variant="h6" className="comment-label">
            Comment:
          </Typography>
          <TextField
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            placeholder="Write your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
          />
        </div>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            marginTop: 3,
            padding: "10px 0",
            backgroundColor: "#CBA36B",
            "&:hover": {
              backgroundColor: "#A97C50",
            },
          }}
        >
          Submit Feedback
        </Button>
      </form>

      {/* Success Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Feedback Sent</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your feedback has been submitted successfully!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FeedbackPage;
