import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTranslation } from "react-i18next"; // Import useTranslation
import Typography from "@mui/material/Typography";

import Button from "@mui/material/Button";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import "./UpdateHall.css"; // CSS for styling the update page
import { fetchWithAuth } from "../../../apiClient"; // Import the fetchWithAuth function
const libraries = ["places"]; // Required for Places Autocomplete

const UpdateHall = () => {
  const { hallId } = useParams(); // Get hallId from the URL
  const [hallData, setHallData] = useState({
    name: "",
    location: "",
    capacity: 0,
    price: 0,
    description: "",
    phone: "",
    services: [{ serviceName: "", servicePrice: "" }],
    longitude: 0,
    latitude: 0,
    image: [],
  });

  const defaultCategories = {
    WEDDINGS: 0,
    BIRTHDAYS: 0,
    MEETINGS: 0,
    PARTIES: 0,
    FUNERALS: 0,
  };

  const westBankCities = [
    "Ramallah",
    "Nablus",
    "Hebron",
    "Bethlehem",
    "Jericho",
    "Jenin",
    "Tulkarm",
    "Qalqilya",
    "Salfit",
    "Tubas",
    "Beit Jala",
    "Beit Sahour",
    "Dura",
    "Halhul",
    "Yatta",
  ];

  const [city, setCity] = useState(""); // For selected city
  const [markerPosition, setMarkerPosition] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [map, setMap] = useState(null); // Add map state to store the Google Map instance
  const [selectedImage, setSelectedImage] = useState(null); // To keep track of the selected image for deletion
  const [openDialog, setOpenDialog] = useState(false); // To control whether the delete confirmation dialog is open
  const [categoryPrices, setCategoryPrices] = useState({});
  const [existingImages, setExistingImages] = useState([]); // To store the existing images/videos
  const [newImages, setNewImages] = useState([]); // To store newly uploaded images/videos
  const [successMessage, setSuccessMessage] = useState(""); // To display success messages
  const { t } = useTranslation(); // Initialize translation hook

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDl-x5DoQXJ23WIsrGFLOFFTX_DcH37160", // Replace with your Google Maps API key
    libraries,
  });

  useEffect(() => {
    const fetchHallDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `http://localhost:8080/whitelist/${hallId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch hall details");
        }

        const hall = await response.json();

        // Convert services from { "serviceName": price } to an array of objects { serviceName, servicePrice }
        const servicesArray = hall.services
          ? Object.entries(hall.services).map(
              ([serviceName, servicePrice]) => ({
                serviceName,
                servicePrice,
              })
            )
          : [];

        // Merge default categories with the fetched categories
        const mergedCategories = { ...defaultCategories, ...hall.categories };

        // Set hall data and services array
        setHallData({
          ...hall,
          services: servicesArray, // Populate services correctly
        });

        // Set the merged category prices
        setCategoryPrices(mergedCategories);

        // Assuming images are comma-separated in the `image` field
        setExistingImages(hall.image.split(","));
      } catch (error) {
        console.error("Error fetching hall data:", error);
      }
    };

    fetchHallDetails();
  }, [hallId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHallData({
      ...hallData,
      [name]: value,
    });
  };

  // Handle service changes
  const handleServiceChange = (e, index, field) => {
    const updatedServices = [...hallData.services];
    updatedServices[index][field] = e.target.value;
    setHallData({ ...hallData, services: updatedServices });
  };

  // Add a new service
  const addService = () => {
    setHallData({
      ...hallData,
      services: [...hallData.services, { serviceName: "", servicePrice: "" }],
    });
  };

  // Remove a service
  const removeService = (index) => {
    const updatedServices = [...hallData.services];
    updatedServices.splice(index, 1);
    setHallData({ ...hallData, services: updatedServices });
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewImages(selectedFiles);
  };

  // Delete an existing image/video
  const handleDeleteImage = async (imageUrl) => {
    try {
      const token = localStorage.getItem("accessToken");
      const deleteResponse = await fetchWithAuth(
        `http://localhost:8080/hallOwner/${hallId}/delete-image?imageUrl=${encodeURIComponent(
          imageUrl
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete image");
      }

      // Remove the deleted image from the UI
      setExistingImages(existingImages.filter((img) => img !== imageUrl));
      setSuccessMessage("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      // Add category with a default price of 0 if it doesn't exist
      setCategoryPrices((prev) => ({
        ...prev,
        [value]: categoryPrices[value] || 0, // Keep existing price if available, or default to 0
      }));
    } else {
      // Remove the category if unchecked
      const updatedCategories = { ...categoryPrices };
      delete updatedCategories[value];
      setCategoryPrices(updatedCategories);
    }
  };

  // Handle category price input
  const handleCategoryPriceChange = (e, category) => {
    const { value } = e.target;
    setCategoryPrices((prev) => ({
      ...prev,
      [category]: value, // Update the price for the selected category
    }));
  };
  // Prepare services for API payload (convert services to object format)
  const prepareServicesForPayload = () => {
    const servicesObj = {};
    hallData.services.forEach((service) => {
      // Instead of adding a nested "price" object, assign the price directly
      servicesObj[service.serviceName] = service.servicePrice;
    });
    return servicesObj;
  };

  // Submit the form with the updated hall data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      const ownerId = localStorage.getItem("hallOwnerId"); // Get Owner ID from localStorage
      // Check if at least one category is selected
      if (Object.keys(categoryPrices).length === 0) {
        alert("Please select at least one category.");
        return; // Prevent form submission if no category is selected
      }

      // Prepare formData for new images
      const formData = new FormData();
      newImages.forEach((file) => {
        formData.append("image", file);
      });

      if (newImages.length > 0) {
        const uploadResponse = await fetchWithAuth(
          `http://localhost:8080/hallOwner/${hallId}/add-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload new images");
        }

        const newImageUrls = await uploadResponse.text();
        setExistingImages(() => {
          // Use Set to ensure uniqueness
          const uniqueImages = new Set([...newImageUrls.split(",")]);
          return Array.from(uniqueImages); // Convert Set back to an array
        });
      }

      // Update hall details (with services object and categoryPrices)
      const hallPayload = {
        id: hallId, // Use hallId from params
        name: hallData.name,
        location: hallData.location,
        capacity: hallData.capacity,
        price: hallData.price,
        description: hallData.description,
        phone: hallData.phone,
        services: prepareServicesForPayload(), // Convert services to the required object structure
        longitude: hallData.longitude,
        latitude: hallData.latitude,
      };

      // Send the PUT request to update the hall
      const updateHallResponse = await fetchWithAuth(
        `http://localhost:8080/hallOwner/${ownerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(hallPayload),
        }
      );

      if (!updateHallResponse.ok) {
        throw new Error("Failed to update hall");
      }

      // Set success message and refresh the page
      setSuccessMessage("Hall updated successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Delay the reload slightly to ensure the message is visible
    } catch (error) {
      console.error("Error updating hall:", error);
    }
  };

  // Handle city change from the combo box
  const handleCityChange = (e) => {
    const { value } = e.target;
    setCity(value);
    setHallData({
      ...hallData,
      location: value,
    });
  };

  const handlePlaceSelect = () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      const location = place.geometry.location;
      const lat = location.lat();
      const lng = location.lng();

      setHallData({
        ...hallData,
        latitude: lat,
        longitude: lng,
      });
      map.panTo(location); // Center the map on the selected place
    }
  };
  // Open the confirmation dialog for deleting an image
  const handleOpenDialog = (imageUrl) => {
    setSelectedImage(imageUrl); // Set the image to be deleted
    setOpenDialog(true); // Open the dialog
  };

  // Close the confirmation dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
    setSelectedImage(null); // Reset the selected image
  };

  // Confirm the deletion of the image
  const handleConfirmDelete = () => {
    handleDeleteImage(selectedImage); // Proceed with deletion
    handleCloseDialog(); // Close the dialog
  };

  // Handle marker drag
  const handleMarkerDrag = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setHallData({
      ...hallData,
      latitude: lat,
      longitude: lng,
    });
  };

  // Handle map click
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setHallData({
      ...hallData,
      latitude: lat,
      longitude: lng,
    });
    setMarkerPosition({ lat, lng }); // Update marker position
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="update-hall-unique-container">
      <h1 className="update-hall-unique-title">{t("update_hall")}</h1>
      <form onSubmit={handleSubmit}>
        {/* Section: Basic Information */}
        <div className="update-hall-box">
          <h2 className="update-hall-section-title">
            {t("basic_information")}
          </h2>
          <div className="update-hall-form-group">
            <label className="update-hall-input-label">{t("hall_name")}</label>
            <input
              type="text"
              name="name"
              value={hallData.name}
              onChange={handleInputChange}
              className="update-hall-input-field"
              required
            />
          </div>

          <div className="update-hall-form-group">
            <label className="update-hall-input-label">{t("capacity")}</label>
            <input
              type="number"
              name="capacity"
              value={hallData.capacity}
              onChange={handleInputChange}
              className="update-hall-input-field"
              required
            />
          </div>

          <div className="update-hall-form-group">
            <label className="update-hall-input-label">{t("phone")}</label>
            <input
              type="tel"
              name="phone"
              value={hallData.phone}
              onChange={handleInputChange}
              className="update-hall-input-field"
              required
            />
          </div>

          <div className="update-hall-form-group">
            <label className="update-hall-input-label">
              {t("description")}
            </label>
            <textarea
              name="description"
              value={hallData.description}
              onChange={handleInputChange}
              className="update-hall-input-textarea"
              required
            />
          </div>
        </div>

        {/* Section: Location Information */}
        <div className="update-hall-box">
          <h2 className="update-hall-section-title">
            {t("location_information")}
          </h2>

          <div className="update-hall-form-group">
            <label htmlFor="city" className="update-hall-input-label">
              {t("select_city")}
            </label>
            <select
              id="city"
              value={hallData.location}
              onChange={handleCityChange}
              className="update-hall-input-field"
              required
            >
              <option value="">{t("select_city")}</option>
              {westBankCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="update-hall-form-group">
            <label className="update-hall-input-label">
              {t("search_location")}
            </label>
            <Autocomplete
              onLoad={(autocomplete) => setAutocomplete(autocomplete)}
              onPlaceChanged={handlePlaceSelect}
            >
              <input
                type="text"
                name="location"
                className="update-hall-input-field"
                placeholder={t("search_location")}
              />
            </Autocomplete>
          </div>

          <div className="update-hall-form-group">
            <label className="update-hall-input-label">{t("latitude")}</label>
            <input
              type="number"
              name="latitude"
              value={hallData.latitude}
              className="update-hall-input-field"
              readOnly
            />
          </div>

          <div className="update-hall-form-group">
            <label className="update-hall-input-label">{t("longitude")}</label>
            <input
              type="number"
              name="longitude"
              value={hallData.longitude}
              className="update-hall-input-field"
              readOnly
            />
          </div>

          <div className="update-hall-map-container">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "300px" }}
              center={{ lat: hallData.latitude, lng: hallData.longitude }}
              zoom={13}
              onLoad={(mapInstance) => setMap(mapInstance)}
              onClick={handleMapClick}
            >
              <Marker
                position={{ lat: hallData.latitude, lng: hallData.longitude }}
                draggable={true}
                onDragEnd={handleMarkerDrag}
              />
            </GoogleMap>
          </div>
        </div>

        {/* Section: Services */}
        <div className="update-hall-box">
          <h2 className="update-hall-section-title">{t("services")}</h2>
          {hallData.services.map((service, index) => (
            <div key={index} className="update-hall-dynamic-service">
              <input
                type="text"
                value={service.serviceName}
                onChange={(e) => handleServiceChange(e, index, "serviceName")}
                placeholder={`${t("service")} #${index + 1}`}
                className="update-hall-input-field"
                required
              />
              <input
                type="number"
                value={service.servicePrice}
                onChange={(e) => handleServiceChange(e, index, "servicePrice")}
                placeholder={t("service_price")}
                className="update-hall-input-field"
                required
              />
              <button
                type="button"
                className="update-hall-remove-service-btn"
                onClick={() => removeService(index)}
              >
                {t("remove_service")}
              </button>
            </div>
          ))}
          <button
            type="button"
            className="update-hall-add-service-btn"
            onClick={addService}
          >
            {t("add_service")}
          </button>
        </div>

        {/* Section: Categories */}
        <div className="update-hall-box">
          <h2 className="update-hall-section-title">{t("categories")}</h2>
          <div className="update-hall-category-checkboxes">
            {Object.keys(defaultCategories).map((category) => (
              <div key={category} className="update-hall-checkbox-item">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  value={category}
                  onChange={handleCategoryChange}
                  checked={categoryPrices.hasOwnProperty(category)}
                />
                <label htmlFor={`category-${category}`}>{category}</label>

                {categoryPrices.hasOwnProperty(category) && (
                  <input
                    type="number"
                    value={categoryPrices[category]}
                    onChange={(e) => handleCategoryPriceChange(e, category)}
                    className="update-hall-input-field"
                    placeholder={t("price_for_category", { category })}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Existing Images Section */}
        <div className="update-hall-box">
          <h2 className="update-hall-section-title">
            {t("existing_images_videos")}
          </h2>
          <div className="update-hall-existing-images">
            {existingImages.map((img, index) => {
              const isVideo = img.match(/\.(mp4|webm|ogg)$/i);
              return (
                <div key={index} className="update-hall-image-container">
                  {isVideo ? (
                    <video
                      src={img}
                      controls
                      className="update-hall-media"
                    ></video>
                  ) : (
                    <img
                      src={img}
                      alt={`Media ${index}`}
                      className="update-hall-media"
                    />
                  )}
                  <button
                    type="button"
                    className="update-hall-delete-btn"
                    onClick={() => handleOpenDialog(img)}
                    disabled={existingImages.length === 1}
                  >
                    {t("delete_update_hall")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dialog for Delete Confirmation */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{t("confirm_delete")}</DialogTitle>
          <DialogContent>
            <Typography>{t("delete_image_video")}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
            <Button onClick={handleConfirmDelete} color="secondary">
              {t("delete")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* File Upload */}
        <div className="update-hall-box">
          <h2 className="update-hall-section-title">
            {t("add_new_images_videos")}
          </h2>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="update-hall-file-upload-input"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="update-hall-submit-btn">
          {t("update_hall")}
        </button>
        {successMessage && (
          <p className="update-hall-success-message">{t("success_message")}</p>
        )}
      </form>
    </div>
  );
};

export default UpdateHall;
