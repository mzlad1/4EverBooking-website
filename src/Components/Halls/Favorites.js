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

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const userId = localStorage.getItem("userId"); // Get user ID from localStorage
  const token = localStorage.getItem("accessToken"); // Get auth token

  useEffect(() => {
    fetchFavoriteHalls(page);
  }, [page]);

  // Fetch user's favorite halls
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

  // Unfavorite a specific hall
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
        // Remove from favorites on successful unfavorite
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

  // Handle booking a hall
  const handleBookClick = (hallId) => {
    history.push(`/hall/${hallId}`); // Redirect to hall booking page
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        Your Favorite Halls
      </Typography>

      {loading ? (
        <div style={{ textAlign: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {favorites.length === 0 ? (
            <Typography variant="h6" align="center">
              No favorite halls found.
            </Typography>
          ) : (
            favorites.map((hall) => (
              <Grid item key={hall.id} xs={12} sm={6} md={4}>
                <Card sx={{ maxWidth: 345, boxShadow: 3 }}>
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
                      {hall.location} | {hall.capacity} guests
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {hall.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleBookClick(hall.id)}
                      sx={{
                        backgroundColor: "#CBA36B",
                        "&:hover": {
                          backgroundColor: "#A97C50",
                        },
                      }}
                    >
                      Book Now
                    </Button>
                    <IconButton
                      aria-label="unfavorite"
                      onClick={() => handleUnfavoriteClick(hall.id)}
                      sx={{ color: "red" }}
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        sx={{ marginTop: 3 }}
      />
    </Container>
  );
};

export default Favorites;
