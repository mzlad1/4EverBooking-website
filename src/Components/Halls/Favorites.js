import React, { useEffect, useState } from "react";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Typography,
  Grid,
  Container,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useHistory } from "react-router-dom";
import Pagination from "./Pagination"; // Assuming you have a Pagination component
import "./favorites.css"; // Import the new styles
import { useTranslation } from "react-i18next"; // Import useTranslation

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { t } = useTranslation(); // Initialize the translation hook

  const userId = localStorage.getItem("userId"); // Get user ID from localStorage
  const token = localStorage.getItem("accessToken"); // Get auth token

  useEffect(() => {
    fetchFavoriteHalls(page);
  }, [page]);

  const fetchFavoriteHalls = async (currentPage) => {
    setLoading(true);
    const url = `http://localhost:8080/customer/${userId}/favorites?page=${currentPage}&size=10`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setFavorites(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching favorite halls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfavoriteClick = async (hallId) => {
    const url = `http://localhost:8080/customer/${userId}/favorites`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: hallId }),
      });

      if (response.ok) {
        setFavorites((prevFavorites) =>
          prevFavorites.filter((hall) => hall.id !== hallId)
        );
      } else {
        console.error("Failed to unfavorite the hall:", response.status);
      }
    } catch (error) {
      console.error("Error unfavoriting the hall:", error);
    }
  };

  const handleBookClick = (hallId) => {
    history.push(`/hall/${hallId}`); // Redirect to hall booking page
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  return (
    <div className="favorites-page-container">
      <Typography className="favorites-title">
        {t("your_favorite_halls")}
      </Typography>

      {loading ? (
        <div className="loader-container">
          <CircularProgress />
        </div>
      ) : (
        <>
          {favorites.length === 0 ? (
            <Typography className="no-favorites-message">
              {t("no_favorite_halls_found")}
            </Typography>
          ) : (
            <div className="favorites-grid-container">
              {favorites.map((hall) => (
                <Card key={hall.id} sx={{ maxWidth: 345, boxShadow: 3 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={hall.image.split(",")[0]} // First image from the list
                    alt={hall.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="div"
                      gutterBottom
                      sx={{ fontWeight: "bold", color: "#CBA36B" }}
                    >
                      {hall.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ marginBottom: 1 }}
                    >
                      {hall.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hall.capacity} {t("guests")}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleBookClick(hall.id)}
                      sx={{
                        backgroundColor: "#CBA36B",
                        width: "100%",
                        "&:hover": {
                          backgroundColor: "#A97C50",
                        },
                      }}
                    >
                      {t("book_now")}
                    </Button>
                    <IconButton
                      aria-label={t("unfavorite")}
                      onClick={() => handleUnfavoriteClick(hall.id)}
                      sx={{ color: "red" }}
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <div className="pagination-container">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
};

export default Favorites;
