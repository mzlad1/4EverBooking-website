import React, { useEffect, useState, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import "./halls.css";
import AspectRatio from "@mui/joy/AspectRatio";
import { Button, IconButton } from "@mui/material";

import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";
import HeadTitle from "../../Common/HeadTitle/HeadTitle";
import FilterBar from "./Filterbar";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Pagination from "./Pagination";
import { fetchWithAuth } from "../../apiClient"; // Import the fetchWithAuth function
import { CircularProgress } from "@mui/material"; // Import CircularProgress

import {
  People,
  LocationOn,
  Star,
  StarHalf,
  StarOutline,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

const HallsPage = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [filters, setFilters] = useState({});
  const [halls, setHalls] = useState([]);
  const [favorites, setFavorites] = useState([]); // Store favorite hall IDs
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const loader = useRef(null);
  const history = useHistory();
  const location = useLocation();
  const userId = localStorage.getItem("userId"); // Get userId from localStorage
  const token = localStorage.getItem("accessToken"); // Get the token from localStorage

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Fetch user's favorite halls
  const fetchFavorites = async () => {
    const url = `http://localhost:8080/customer/${userId}/favorites?page=1&size=100`;
    try {
      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      // Store only the IDs of the favorite halls
      setFavorites(data.content.map((hall) => hall.id));
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get("search") || "";
    setSearchQuery(search);
    fetchHalls({ ...filters, search }, 1);
  }, [location.search]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  useEffect(() => {
    fetchHalls({ ...filters, search: searchQuery }, page);
  }, [filters, page, searchQuery]);

  const fetchHalls = async (appliedFilters = {}, page = 1) => {
    setLoading(true);
    const {
      city = "",
      category = "",
      minPrice = "",
      maxPrice = "",
      minCapacity = "",
      maxCapacity = "",
      search = "",
      startDate = "",
      endDate = "",
      sortBy = "",
      latitude = "",
      longitude = "",
      userId = "",
    } = appliedFilters;

    // Dynamically set the size based on the screen width
    const screenWidth = window.innerWidth;
    let size;

    if (screenWidth >= 1200) {
      size = 9; // Large screens
    } else if (screenWidth >= 768) {
      size = 6; // Medium screens (tablets)
    } else {
      size = 3; // Small screens (mobile)
    }

    const apiUrl = `http://localhost:8080/whitelist/getAll?page=${page}&size=${size}&search=${encodeURIComponent(
      search
    )}&location=${encodeURIComponent(city)}&category=${encodeURIComponent(
      category
    )}&minPrice=${minPrice}&maxPrice=${maxPrice}&minCapacity=${minCapacity}&maxCapacity=${maxCapacity}${
      startDate ? `&startDate=${startDate}` : ""
    }${endDate ? `&endDate=${endDate}` : ""}${
      sortBy === "location"
        ? `&filterByProximity=true&latitude=${latitude}&longitude=${longitude}&radius=15`
        : ""
    }${
      sortBy === "recommended"
        ? `&sortByRecommendation=true&userId=${userId}`
        : ""
    }${
      sortBy === "price" ? "&sortByPrice=true" : "" // Ensure sortByPrice is included when "price" is selected
    }`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      setHalls(data.content);
      setTotalPages(data.totalPages);
      console.log("API URL:", apiUrl);
    } catch (error) {
      console.error("Failed to fetch halls:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {Array(fullStars)
          .fill(0)
          .map((_, index) => (
            <Star key={`full-${index}`} style={{ color: "#c29d6d" }} />
          ))}
        {hasHalfStar && <StarHalf style={{ color: "#c29d6d" }} />}
        {Array(emptyStars)
          .fill(0)
          .map((_, index) => (
            <StarOutline key={`empty-${index}`} style={{ color: "#c29d6d" }} />
          ))}
      </>
    );
  };

  // Toggle favorite status for a specific hall
  const handleFavoriteClick = async (hallId) => {
    // Check if the user is logged in
    if (!userId || !token) {
      // Redirect to sign-in page if not logged in
      history.push("/sign-in");
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      return;
    }
    try {
      // Check if the hall is already in favorites
      const isFavorited = favorites.includes(hallId);

      // Define the API endpoint
      const url = `http://localhost:8080/customer/${userId}/favorites`;

      // Choose between POST and DELETE based on the current favorite status
      const method = isFavorited ? "DELETE" : "POST"; // DELETE if already favorited, POST if not

      // Make the API request using fetch
      const response = await fetchWithAuth(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`, // Authorization with Bearer token
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: hallId, // Sending only the hallId
        }),
      });

      // Check if the response is successful
      if (response.ok) {
        setFavorites((prevFavorites) =>
          isFavorited
            ? prevFavorites.filter((id) => id !== hallId)
            : [...prevFavorites, hallId]
        ); // Toggle favorite status on success
        console.log("Favorite status updated successfully");
      } else {
        console.error("Failed to update favorite status", response.status);
      }
    } catch (error) {
      console.error("Failed to favorite the hall", error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const getHallImage = (images) => {
    const mediaList = images.split(",");
    const videoExtensions = ["mp4", "avi", "mov", "wmv"]; // Add more video extensions if needed

    // Check if the first media is a video
    const firstMediaIsVideo = videoExtensions.some((ext) =>
      mediaList[0].toLowerCase().endsWith(ext)
    );

    // Return the second image if the first is a video, else return the first
    if (firstMediaIsVideo && mediaList.length > 1) {
      return mediaList[1];
    } else {
      return mediaList[0]; // Return the first image if it's not a video
    }
  };

  return (
    <>
      <HeadTitle />
      <div className="search-body-modern">
        <div className="search-container-modern">
          <input
            type="text"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            placeholder={t("search_placeholder")} // Use translated text
            autoFocus
            className="search-input-modern"
          />
        </div>
      </div>
      <div
        className="main-container-modern"
        style={{
          minHeight: halls.length === 0 && !loading ? "100vh" : "auto",
        }}
      >
        <FilterBar onFilterChange={handleFilterChange} />
        <div
          className={`page-container-modern ${
            halls.length <= 3 ? "few-cards" : ""
          } ${halls.length === 1 ? "single-card" : ""}`}
        >
          {halls.length === 0 && searchQuery && !loading && (
            <p className="no-results-modern">
              {t("no_halls_found", { query: searchQuery })} {/* Translated */}
            </p>
          )}
          {halls.map((hall, index) => {
            const categoryPrices = Object.values(hall.categories || {}).map(
              (price) => Math.floor(price)
            );

            const lowPrice = Math.min(...categoryPrices);
            const highPrice = Math.max(...categoryPrices);

            const servicePrices = Object.values(hall.services || {}).map(
              (price) => Math.floor(price)
            );

            const totalServicesPrice = servicePrices.reduce(
              (total, price) => total + price,
              0
            );

            const highPriceWithServices =
              Number(highPrice + totalServicesPrice) || 0;

            return (
              <Card
                className="hall-card-modern"
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  maxWidth: "100%",
                  boxShadow: "lg",
                  marginBottom: "20px",
                  overflow: "hidden",
                }}
              >
                {/* Image Section */}
                <div
                  className="hall-card-image"
                  style={{ position: "relative", flex: "0 0 40%" }}
                >
                  <AspectRatio sx={{ height: "100%", width: "100%" }}>
                    <img
                      src={getHallImage(hall.image)}
                      alt={`Hall ${index}`}
                      className="hall-image-modern"
                      loading="lazy"
                    />
                  </AspectRatio>
                  {/* Favorite Button */}
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      color: favorites.includes(hall.id) ? "red" : "#CBA36B",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                      },
                    }}
                    onClick={() => handleFavoriteClick(hall.id)}
                  >
                    {favorites.includes(hall.id) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </div>

                {/* Info Section */}
                <div
                  className="hall-card-info"
                  style={{ flex: "1", padding: "20px" }}
                >
                  <Typography
                    level="h1"
                    className="hall-title-modern"
                    sx={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "#c29d6d",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {hall.name}
                  </Typography>

                  <Typography
                    level="title-lg"
                    className="hall-price-modern"
                    sx={{ mt: 1, fontWeight: "xl" }}
                  >
                    ${lowPrice.toFixed(2)} - ${highPriceWithServices.toFixed(2)}
                  </Typography>

                  <div
                    className="rating-stars-modern"
                    style={{ marginTop: "10px" }}
                  >
                    {renderStars(hall.averageRating)}
                    <Typography
                      level="body-xs"
                      sx={{ marginLeft: "10px", color: "#666" }}
                    >
                      {hall.averageRating.toFixed(1)}
                    </Typography>
                  </div>

                  <div
                    className="capacity-location-row-modern"
                    style={{ marginTop: "15px" }}
                  >
                    <Typography level="body-sm" className="capacity-modern">
                      <People
                        style={{ color: "#c29d6d", marginRight: "5px" }}
                      />
                      {hall.capacity} {t("guests")}
                    </Typography>
                    <Typography level="body-sm" className="location-modern">
                      <LocationOn
                        style={{ color: "#c29d6d", marginRight: "5px" }}
                      />
                      {t(`west_bank_cities.${hall.location}`)}
                    </Typography>
                  </div>

                  <Button
                    variant="solid"
                    size="lg"
                    className="book-now-button-modern"
                    sx={{
                      backgroundColor: "#CBA36B",
                      width: "35%",
                      color: "#ffffff",
                      marginTop: "20px",
                      "&:hover": {
                        backgroundColor: "#A97C50",
                        color: "#ffffff",
                      },
                    }}
                    onClick={() => history.push(`/hall/${hall.id}`)}
                  >
                    {t("book_now")}
                  </Button>
                </div>
              </Card>
            );
          })}
          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100px",
              }}
            >
              <CircularProgress size={50} />{" "}
              {/* Circular spinner with a size of 50px */}
            </div>
          )}{" "}
          <div ref={loader} style={{ height: "20px" }}></div>
        </div>
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="pagination-modern"
      />
    </>
  );
};

export default HallsPage;
