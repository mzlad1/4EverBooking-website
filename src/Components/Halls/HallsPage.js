import React, { useEffect, useState, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import "./halls.css";
import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";
import HeadTitle from "../../Common/HeadTitle/HeadTitle";
import FilterBar from "./Filterbar";
import Pagination from "./Pagination";
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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const loader = useRef(null);

  const history = useHistory();
  const location = useLocation();

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
    } = appliedFilters;

    const apiUrl = `http://localhost:8080/whitelist/getAll?page=${page}&size=12&search=${encodeURIComponent(
      search
    )}&location=${encodeURIComponent(city)}&category=${encodeURIComponent(
      category
    )}&minPrice=${minPrice}&maxPrice=${maxPrice}&minCapacity=${minCapacity}&maxCapacity=${maxCapacity}`;

    console.log("API URL:", apiUrl);

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const filteredHalls = data.content.filter((hall) => {
        const categoryPrices = Object.values(hall.categories || {});
        if (categoryPrices.length === 0) return false;

        const lowPrice = Math.min(...categoryPrices);
        const highPrice = Math.max(...categoryPrices);

        const servicePrices = Object.values(hall.services || {});
        const totalServicesPrice = servicePrices.reduce(
          (total, price) => total + price,
          0
        );

        const highPriceWithServices = highPrice + totalServicesPrice;

        const isPriceValid =
          (!minPrice || lowPrice >= minPrice) &&
          (!maxPrice || highPriceWithServices <= maxPrice);

        return isPriceValid;
      });

      setHalls(filteredHalls);
      setTotalPages(data.totalPages);
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
        <div className="page-container-modern">
          {halls.length === 0 && searchQuery && !loading && (
            <p className="no-results-modern">
              {t("no_halls_found", { query: searchQuery })} {/* Translated */}
            </p>
          )}
          {halls.map((hall, index) => {
            const categoryPrices = Object.values(hall.categories || {}).map(
              (price) => Math.floor(price) // Ensure only integer part of the price is used
            );

            const lowPrice = Math.min(...categoryPrices);
            const highPrice = Math.max(...categoryPrices);

            const servicePrices = Object.values(hall.services || {}).map(
              (price) => Math.floor(price) // Ensure service prices also only use the integer part
            );

            const totalServicesPrice = servicePrices.reduce(
              (total, price) => total + price,
              0
            );

            // Calculate highPriceWithServices and ensure it's a valid number
            const highPriceWithServices =
              Number(highPrice + totalServicesPrice) || 0;

            return (
              <Card
                className="hall-card-modern"
                key={index}
                sx={{
                  width: 320,
                  maxWidth: "100%",
                  boxShadow: "lg",
                  marginBottom: "20px",
                }}
              >
                <CardOverflow>
                  <AspectRatio sx={{ minWidth: 200 }}>
                    <img
                      src={getHallImage(hall.image)} // Use the helper function to get the image
                      alt={`Hall ${index}`}
                      className="hall-image-modern"
                      loading="lazy"
                    />
                  </AspectRatio>
                </CardOverflow>
                <CardContent className="card-content-modern">
                  <Typography
                    level="h1"
                    className="hall-title-modern"
                    sx={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "#c29d6d",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      mt: 2,
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

                  <div className="rating-stars-modern">
                    {renderStars(hall.averageRating)}
                    <Typography
                      level="body-xs"
                      sx={{ marginLeft: "10px", color: "#666" }}
                    >
                      {hall.averageRating.toFixed(1)}
                    </Typography>
                  </div>

                  <div className="capacity-location-row-modern">
                    <Typography level="body-sm" className="capacity-modern">
                      <People
                        style={{ color: "#c29d6d", marginRight: "5px" }}
                      />
                      {hall.capacity} {t("guests")}{" "}
                      {/* Translated text for "guests" */}
                    </Typography>
                    <Typography level="body-sm" className="location-modern">
                      <LocationOn
                        style={{ color: "#c29d6d", marginRight: "5px" }}
                      />
                      {t(`west_bank_cities.${hall.location}`)}{" "}
                      {/* Translate location if it's a city */}
                    </Typography>
                  </div>
                </CardContent>
                <CardOverflow className="card-footer-modern">
                  <Button
                    variant="solid"
                    size="lg"
                    className="book-now-button-modern"
                    sx={{
                      backgroundColor: "#CBA36B",
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "#A97C50",
                        color: "#ffffff",
                      },
                    }}
                    onClick={() => history.push(`/hall/${hall.id}`)}
                  >
                    {t("book_now")} {/* Translated text for "Book Now" */}
                  </Button>
                </CardOverflow>
              </Card>
            );
          })}
          {loading && <p className="loading-text-modern">{t("loading")}</p>}{" "}
          {/* Translated loading text */}
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