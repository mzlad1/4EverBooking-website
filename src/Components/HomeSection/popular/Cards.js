import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import { fetchWithAuth } from "../../../apiClient"; // Import the fetchWithAuth function

const SampleNextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="reco-control-btn" onClick={onClick}>
      <button className="next">
        <i className="fa fa-long-arrow-alt-right"></i>
      </button>
    </div>
  );
};

const SamplePrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="reco-control-btn" onClick={onClick}>
      <button className="prev">
        <i className="fa fa-long-arrow-alt-left"></i>
      </button>
    </div>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="arrow arrow-right" onClick={onClick}>
      <button>
        <i className="fa fa-chevron-right"></i>
      </button>
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="arrow arrow-left" onClick={onClick}>
      <button>
        <i className="fa fa-chevron-left"></i>
      </button>
    </div>
  );
};

// HallSlider Component (Updated to correctly use images)
const HallSlider = ({ images }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <Slider {...settings}>
      {images.map((imageUrl, index) => (
        <div key={index}>
          <img
            src={imageUrl}
            alt={`Slide ${index + 1}`}
            style={{ width: "100%", height: "auto" }} // Ensures the image fits correctly
          />
        </div>
      ))}
    </Slider>
  );
};

// Main Cards Component
const Cards = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [popularHalls, setPopularHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHalls = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/customer/recommendhalls",
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPopularHalls(data);
      } catch (error) {
        setError(error);
        console.error("Error fetching halls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
    ],
  };

  const renderStars = (rating) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;

    return (
      <div className="rate">
        {[...Array(fullStars)].map((_, index) => (
          <i key={index} className="fa fa-star"></i>
        ))}
        {halfStar && <i className="fa fa-star-half-alt"></i>}
        {[...Array(totalStars - fullStars - (halfStar ? 1 : 0))].map(
          (_, index) => (
            <i key={index} className="far fa-star"></i>
          )
        )}
      </div>
    );
  };

  const handleBookNow = (hallId) => {
    window.location.href = `/hall/${hallId}`;
  };

  const calculatePriceRange = (categories, services) => {
    const categoryPrices = Object.values(categories)
      .map(Number)
      .filter((price) => !isNaN(price));
    const lowPrice = Math.min(...categoryPrices);
    const highPrice = Math.max(...categoryPrices);

    const totalServicesPrice = Object.values(services)
      .map(Number)
      .filter((price) => !isNaN(price))
      .reduce((total, price) => total + price, 0);

    if (isNaN(lowPrice) || isNaN(highPrice)) {
      return "Invalid category prices";
    }

    const highPriceWithServices = highPrice + totalServicesPrice;
    return `$${lowPrice.toFixed(2)} - $${highPriceWithServices.toFixed(2)}`;
  };

  // Function to translate West Bank cities
  const translateLocation = (location) => {
    return t(location.toLowerCase().replace(/\s+/g, "_")); // Convert city name to key
  };

  if (loading) return <p>{t("loading")}</p>; // Translated loading message
  if (error) return <p>{t("error_loading_data")}</p>; // Translated error message

  return (
    <Slider {...settings}>
      {popularHalls.map((value) => {
        // Split the image URLs and trim any spaces, then pass them as an array to HallSlider
        const imageUrls = value.image
          ? value.image.split(",").map((url) => url.trim())
          : [];

        return (
          <div className="cards" key={value.id}>
            <div className="item">
              <div className="image">
                <HallSlider images={imageUrls} /> {/* Pass parsed image URLs */}
              </div>
              <div className="details">
                <div className="price">
                  <i className="fa fa-tag"></i>{" "}
                  {calculatePriceRange(value.categories, value.services)}
                  <span>{t("per_day")}</span> {/* Translated "Per Day" */}
                </div>
                {renderStars(value.averageRating)}
                <h2>{value.name}</h2>
                <div className="boarder"></div>
                <h3 className="capacity-location">
                  <div className="capacity-container">
                    <i className="fa fa-users"></i>{" "}
                    <label>
                      {value.capacity} <span>{t("capacity")}</span>{" "}
                      {/* Translated "Capacity" */}
                    </label>
                  </div>
                  <div className="location-container">
                    <i className="fas fa-map-marker-alt"></i>
                    <label>{translateLocation(value.location)}</label>{" "}
                    {/* Translated location */}
                  </div>
                </h3>
                <button
                  className="book-now"
                  onClick={() => handleBookNow(value.id)}
                >
                  {t("book_now")} {/* Translated "Book Now" */}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </Slider>
  );
};

export default Cards;
