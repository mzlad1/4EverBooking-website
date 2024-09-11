import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"; // Google Maps components
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS
import L from "leaflet"; // Leaflet for custom marker icon
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from "react-calendar";
import { useTranslation } from "react-i18next"; // Import translation hook
import "react-calendar/dist/Calendar.css";
import { useHistory } from "react-router-dom";

import {
  People,
  Star,
  StarHalf,
  StarOutline,
  AttachMoney,
  LocationOn,
  CalendarToday,
  Close,
} from "@mui/icons-material";
import "./hallDetails.css";

// Set up default marker icon for Leaflet (to avoid missing icons)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const containerStyle = {
  width: "97%",
  height: "400px",
  borderRadius: "10px",
  border: "2px solid #c29d6d",
};

const HallDetailsPage = () => {
  const { id } = useParams();
  const [hall, setHall] = useState(null);
  const [images, setImages] = useState([]);
  const sliderRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [reservedDays, setReservedDays] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    calendarDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(calendarDate.getFullYear());
  const [isFromDateCalendarVisible, setFromDateCalendarVisible] =
    useState(false);
  const [isToDateCalendarVisible, setToDateCalendarVisible] = useState(false);
  const { t } = useTranslation(); // Initialize translation hook
  const history = useHistory();
  const [selectedMedia, setSelectedMedia] = useState(null); // For the clicked media item
  const [isModalVisible, setModalVisible] = useState(false); // For showing/hiding the modal
  const media = images; // Use images from the API response
  const [errors, setErrors] = useState({
    categoryError: "",
    fromDateError: "",
    toDateError: "",
  });
  // Load Google Maps script using the API key
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDl-x5DoQXJ23WIsrGFLOFFTX_DcH37160",
  });

  const fetchReservedDays = async (year, month) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8080/customer/${id}/reserved-days?year=${year}&month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "*/*",
          },
        }
      );
      const data = await response.json();
      setReservedDays(data);
    } catch (error) {
      console.error("Failed to fetch reserved days:", error);
    }
  };

  // Fetch hall details once when component is mounted
  useEffect(() => {
    const fetchHallDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/whitelist/${id}`);
        const data = await response.json();

        // Log the entire data to see if 'image' field exists
        console.log("API Response:", data);

        if (data.image) {
          setImages(data.image.split(",")); // Assuming images are in a comma-separated string
        } else {
          console.error("No images found in response.");
        }

        setHall(data);
      } catch (error) {
        console.error("Failed to fetch hall details:", error);
      }
    };
    fetchHallDetails();
  }, [id]);

  // Fetch reserved days whenever the selected month or year changes
  useEffect(() => {
    fetchReservedDays(selectedYear, selectedMonth);
  }, [selectedMonth, selectedYear, id]);

  // Handle the event when the user changes the active month on the calendar
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    const newYear = activeStartDate.getFullYear();
    const newMonth = activeStartDate.getMonth() + 1;
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
  };

  const handleReserveNow = () => {
    // Check if the user is logged in by verifying if an access token exists
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      // If no access token is found, redirect to the login page
      history.push("/sign-in");
      return; // Exit the function early to prevent further actions
    }

    let newErrors = { categoryError: "", fromDateError: "", toDateError: "" };

    if (!selectedCategory) {
      newErrors.categoryError = "Please select a category.";
    }

    if (!fromDate) {
      newErrors.fromDateError = "Please select a 'from' date.";
    }

    if (selectedCategory === "FUNERALS" && !toDate) {
      newErrors.toDateError = "Please select a 'to' date for funerals.";
    }

    setErrors(newErrors);

    // If there are any errors, don't proceed
    if (
      newErrors.categoryError ||
      newErrors.fromDateError ||
      newErrors.toDateError
    ) {
      return;
    }

    // Only pass the category name
    const cleanCategory = selectedCategory.split(" - ")[0]; // Assuming category is in format "Weddings - 100"

    // If no errors, proceed with navigation
    const totalPrice = calculateTotalPrice();
    history.push({
      pathname: `/reserve`,
      state: {
        hallId: hall.id, // Ensure hall ID is passed
        customerId: localStorage.getItem("customerId"), // Ensure customer ID is passed from localStorage
        totalPrice,
        selectedServices,
        selectedCategory: cleanCategory, // Passing only the category name
        fromDate,
        toDate,
      },
    });
  };

  const tileDisabled = ({ date, view }) => {
    const today = new Date();

    if (view === "month") {
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() < today.getDate()
      ) {
        return true;
      }
      if (
        date < today &&
        (date.getFullYear() < today.getFullYear() ||
          date.getMonth() < today.getMonth())
      ) {
        return true;
      }
      if (
        date.getFullYear() === selectedYear &&
        date.getMonth() + 1 === selectedMonth
      ) {
        const day = date.getDate();
        return reservedDays.includes(day);
      }
    }
    return false;
  };

  const calculateTotalPrice = () => {
    if (!hall || !selectedCategory) return 0; // Ensure hall and category exist

    // Get the price of the selected category and ensure it's a number
    const categoryPrice = Math.floor(hall.categories[selectedCategory] || 0);

    // Calculate the total price for selected services, ensuring valid numbers
    const totalServicesPrice = selectedServices.reduce((total, service) => {
      return total + Math.floor(service.price || 0); // Use Math.floor() to ensure no decimal places
    }, 0);

    // Return the sum of category price and total services price
    return categoryPrice + totalServicesPrice;
  };

  const handleNextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += sliderRef.current.offsetWidth;
    }
  };

  const handlePreviousSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= sliderRef.current.offsetWidth;
    }
  };

  const handleServiceChange = (serviceName) => {
    const servicePrice = hall.services[serviceName]; // Get the service price from hall.services

    // Check if the service is already selected
    if (selectedServices.some((service) => service.name === serviceName)) {
      // If service is already selected, remove it
      setSelectedServices(
        selectedServices.filter((service) => service.name !== serviceName)
      );
    } else {
      // Add the service with its name and price
      setSelectedServices([
        ...selectedServices,
        { name: serviceName, price: servicePrice },
      ]);
    }
  };

  // Function to detect if media is a video
  const isVideo = (mediaUrl) => {
    const videoExtensions = ["mp4", "webm", "ogg"];
    const extension = mediaUrl.split(".").pop().toLowerCase();
    return videoExtensions.includes(extension);
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

  const calculatePriceRange = () => {
    if (!hall || !hall.categories || !hall.services) return "N/A";

    // Ensure category prices are valid numbers
    const categoryPrices = Object.values(hall.categories).map(
      (price) => Math.floor(price || 0) // Use Math.floor() to remove any decimal places
    );
    const lowPrice = Math.min(...categoryPrices);
    const highPrice = Math.max(...categoryPrices);

    // Ensure service prices are valid numbers
    const totalServicesPrice = Object.values(hall.services || {}).reduce(
      (total, price) => total + Math.floor(price || 0), // Use Math.floor() to ensure no decimal places
      0
    );

    const highPriceWithServices = highPrice + totalServicesPrice;

    // Return price range as a formatted string
    return (
      <span>
        <AttachMoney style={{ color: "#c29d6d", marginRight: "5px" }} />
        {`${lowPrice.toFixed(2)} - ${highPriceWithServices.toFixed(2)}`}
      </span>
    );
  };

  // Function to handle clicking an image or video and opening the modal
  // Function to handle clicking a media (image/video) and opening the modal
  const handleMediaClick = (mediaUrl) => {
    const isVideo = mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".avi");

    if (!isVideo) {
      setSelectedMedia(mediaUrl); // Set the selected image URL
      setModalVisible(true); // Show the modal only for images
    }
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setModalVisible(false); // Hide the modal
    setSelectedMedia(null); // Clear the selected media
  };

  const CustomDateInput = ({ value, onClick, label }) => (
    <div className="custom-date-input">
      <label>{label}</label>
      <div className="date-input-container" onClick={onClick}>
        <input
          type="text"
          value={value || ""}
          placeholder="mm/dd/yyyy"
          readOnly
          className="custom-date-picker"
        />
        <span className="calendar-icon">
          <CalendarToday style={{ color: "#fff", fontSize: "18px" }} />
        </span>
      </div>
    </div>
  );

  const toggleFromDateCalendar = () => {
    setFromDateCalendarVisible(!isFromDateCalendarVisible);
    setToDateCalendarVisible(false); // Close To date calendar if it's open
  };

  const toggleToDateCalendar = () => {
    setToDateCalendarVisible(!isToDateCalendarVisible);
    setFromDateCalendarVisible(false); // Close From date calendar if it's open
  };

  if (!hall || !isLoaded) return <p>Loading...</p>;

  return (
    <div className="hall-details-page">
      <div className="hall-main-content">
        <div className="images-container">
          <button
            className="prev-button"
            onClick={() =>
              (sliderRef.current.scrollLeft -= sliderRef.current.offsetWidth)
            }
          >
            &lt;
          </button>
          <div className="image-slider-container" ref={sliderRef}>
            {media.map((item, index) => {
              const isVideo = item.endsWith(".mp4") || item.endsWith(".avi");

              return isVideo ? (
                <video
                  key={index}
                  className="slider-video"
                  controls
                  onClick={() => handleMediaClick(item)} // Open video in modal
                >
                  <source src={item} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  key={index}
                  src={item}
                  alt={`Slide ${index}`}
                  className="slider-media"
                  onClick={() => handleMediaClick(item)} // Open image in modal
                />
              );
            })}
          </div>
          <button
            className="next-button"
            onClick={() =>
              (sliderRef.current.scrollLeft += sliderRef.current.offsetWidth)
            }
          >
            &gt;
          </button>
        </div>

        {/* Modal for showing selected media */}
        {isModalVisible && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-button" onClick={handleCloseModal}>
                <Close />
              </button>
              {selectedMedia.endsWith(".mp4") ? (
                <video className="modal-video" controls autoPlay>
                  <source src={selectedMedia} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={selectedMedia}
                  alt="Selected"
                  className="modal-image"
                />
              )}
            </div>
          </div>
        )}

        <div className="hall-info">
          <div className="hall-header">
            <h2>{hall.name}</h2>
            <div className="hall-rating">
              <span className="rating-text">
                ({hall.hallRatings.length} {t("reviews")}){" "}
                {hall.averageRating.toFixed(2)}
              </span>
              {renderStars(hall.averageRating)}
            </div>
          </div>

          <p className="hall-price">
            {calculatePriceRange()}{" "}
            <span style={{ color: "#888888" }}>{t("per_day")}</span>
          </p>

          <hr className="separator" />

          <div className="hall-details-icons">
            <div className="hall-detail">
              <People style={{ color: "#c29d6d", marginRight: "10px" }} />
              <span>
                {hall.capacity} {t("person_guests")}
              </span>
            </div>
            <div className="hall-detail">
              <LocationOn style={{ color: "#c29d6d", marginRight: "10px" }} />
              <span>{t(`cities.${hall.location.toLowerCase()}`)}</span>
            </div>
          </div>
        </div>

        <div className="hall-description">
          <h3>{t("description")}</h3>
          <p>{hall.description}</p>
        </div>

        <div className="hall-calendar">
          <h3>{t("calendar")}</h3>
          <Calendar
            onChange={setCalendarDate}
            value={calendarDate}
            tileDisabled={tileDisabled}
            onActiveStartDateChange={handleActiveStartDateChange} // Handle month changes
          />
        </div>

        {/* Google Maps Section */}
        <div className="hall-location">
          <h3>{t("location")}</h3>
          {hall.latitude && hall.longitude ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={{ lat: hall.latitude, lng: hall.longitude }}
              zoom={15}
            >
              <Marker position={{ lat: hall.latitude, lng: hall.longitude }} />
            </GoogleMap>
          ) : (
            <p>{t("location_not_available")}</p>
          )}
        </div>
      </div>

      <div className="hall-sidebar">
        <h3>{t("book_hall")}</h3>
        <div className="sidebar-content">
          <div className="category-select">
            <label htmlFor="category">{t("category")}</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">{t("select_category")}</option>
              {hall.categories &&
                Object.keys(hall.categories).map((category) => (
                  <option key={category} value={category}>
                    {category} - ${hall.categories[category]}
                  </option>
                ))}
            </select>
            {errors.categoryError && (
              <p className="error-message">{errors.categoryError}</p>
            )}
          </div>

          <div className="date-picker">
            <CustomDateInput
              value={fromDate ? fromDate.toLocaleDateString() : ""}
              label={t("from")}
              onClick={toggleFromDateCalendar}
            />
            {isFromDateCalendarVisible && (
              <Calendar
                onChange={(date) => {
                  setFromDate(date);
                  setFromDateCalendarVisible(false);
                }}
                value={fromDate || new Date()}
                tileDisabled={tileDisabled}
                onActiveStartDateChange={handleActiveStartDateChange} // Fetch reserved days when user changes month
              />
            )}
            {errors.fromDateError && (
              <p className="error-message">{errors.fromDateError}</p>
            )}
          </div>

          {selectedCategory === "FUNERALS" && (
            <div className="date-picker">
              <CustomDateInput
                value={toDate ? toDate.toLocaleDateString() : ""}
                label={t("to")}
                onClick={toggleToDateCalendar}
              />
              {isToDateCalendarVisible && (
                <Calendar
                  onChange={(date) => {
                    setToDate(date);
                    setToDateCalendarVisible(false);
                  }}
                  value={toDate || new Date()}
                  tileDisabled={tileDisabled}
                  onActiveStartDateChange={handleActiveStartDateChange} // Fetch reserved days when user changes month
                />
              )}
              {errors.toDateError && (
                <p className="error-message">{errors.toDateError}</p>
              )}
            </div>
          )}
          {hall.services && (
            <>
              <h4>{t("add_extra")}</h4>
              <div className="services-checkboxes">
                {Object.keys(hall.services).map((service) => (
                  <div key={service} className="service-item">
                    <input
                      type="checkbox"
                      id={`service-${service}`} // Unique ID for each checkbox
                      checked={selectedServices.some((s) => s.name === service)} // Check if the service is selected
                      onChange={() => handleServiceChange(service)} // Toggle the service
                    />
                    <label
                      htmlFor={`service-${service}`}
                      className="service-label"
                    >
                      {" "}
                      {/* Link the label to the checkbox */}
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </label>
                    <span className="services-price">
                      ${hall.services[service]}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <hr className="separator" />

          <div className="total-price">
            <h4>Total Price:</h4>
            <p>
              <AttachMoney style={{ color: "#c29d6d", marginRight: "5px" }} />
              {calculateTotalPrice()}{" "}
              {/* Call the function to display the calculated total price */}
            </p>
          </div>
          <button className="book-now-button" onClick={handleReserveNow}>
            {t("book_now")}
          </button>
        </div>
      </div>

      {/* Media Modal */}
      {isModalVisible && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseModal}>
              <Close />
            </button>
            {isVideo(selectedMedia) ? (
              <video src={selectedMedia} controls className="modal-media" />
            ) : (
              <img src={selectedMedia} alt="Selected" className="modal-media" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HallDetailsPage;
