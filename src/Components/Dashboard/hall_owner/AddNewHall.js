import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation

import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import { fetchWithAuth } from "../../../apiClient"; // Import the fetchWithAuth function
import { History } from "react-router-dom";
import "./AddNewHall.css";

const libraries = ["places"]; // Required for Places Autocomplete

const AddNewHall = () => {
      const { t } = useTranslation(); // Initialize translation hook
  const [hallData, setHallData] = useState({
    name: "",
    city: "",
    capacity: "",
    phone: "",
    price: "",
    description: "",
    services: [
      { serviceName: "Cake", servicePrice: "" },
      { serviceName: "Drinks", servicePrice: "" },
    ], // Default services
    categories: [],
    latitude: "",
    longitude: "",
    image: null,
    proofOfOwnership: null,
  });

  const [successMessage, setSuccessMessage] = useState(""); // To store success message
  const [isProcessing, setIsProcessing] = useState(false); // To track the processing state
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDl-x5DoQXJ23WIsrGFLOFFTX_DcH37160", // Replace with your actual Google Maps API Key
    libraries,
  });

  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({
    lat: hallData.latitude || 51.505,
    lng: hallData.longitude || -0.09,
  });

  // When user clicks on the map, update the marker and coordinates
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    setHallData({
      ...hallData,
      latitude: lat,
      longitude: lng,
    });
  };

  // When a place is selected from the search autocomplete, update the marker and map
  const handlePlaceSelect = () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      const location = place.geometry.location;
      const lat = location.lat();
      const lng = location.lng();
      setMarkerPosition({ lat, lng });
      setHallData({
        ...hallData,
        latitude: lat,
        longitude: lng,
      });
      map.panTo(location); // Center the map to the selected place
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHallData({
      ...hallData,
      [name]: value,
    });
  };

  const handleServiceChange = (e, index, field) => {
    const updatedServices = [...hallData.services];
    updatedServices[index][field] = e.target.value;
    setHallData({ ...hallData, services: updatedServices });
  };

  const addService = () => {
    setHallData({
      ...hallData,
      services: [...hallData.services, { serviceName: "", servicePrice: "" }],
    });
  };

  const removeService = (index) => {
    const updatedServices = [...hallData.services];
    updatedServices.splice(index, 1);
    setHallData({ ...hallData, services: updatedServices });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // Convert FileList to an array
    setHallData({
      ...hallData,
      image: selectedFiles, // Store the selected files in the image field
    });
  };

  const [categoryPrices, setCategoryPrices] = useState({}); // State to store category prices

  // Handle category selection and price input
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      // If category is selected, add it to the categoryPrices object with a default price of 0
      setCategoryPrices({
        ...categoryPrices,
        [value]: 0,
      });
    } else {
      // If category is deselected, remove it from the categoryPrices object
      const updatedCategories = { ...categoryPrices };
      delete updatedCategories[value];
      setCategoryPrices(updatedCategories);
    }
  };

  // Handle category price input change
  const handleCategoryPriceChange = (e, category) => {
    const { value } = e.target;
    setCategoryPrices({
      ...categoryPrices,
      [category]: value, // Update the price for the selected category
    });
  };

  // Validation errors
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Basic Information Validation
    if (!(hallData.name || "").trim())
      newErrors.name = "Hall name is required.";
    if (!(hallData.capacity || "").trim())
      newErrors.capacity = "Capacity is required.";
    if (!(hallData.phone || "").trim())
      newErrors.phone = "Phone number is required.";
    if (!(hallData.description || "").trim())
      newErrors.description = "Description is required.";

    // Location Validation
    if (!(hallData.city || "").trim()) newErrors.city = "City is required.";
    if (!hallData.latitude || !hallData.longitude) {
      newErrors.location = "Latitude and longitude are required.";
    }

    // Services Validation
    hallData.services.forEach((service, index) => {
      if ((service.serviceName || "").trim() && !service.servicePrice) {
        newErrors[`servicePrice-${index}`] =
          "Service price is required if service name is provided.";
      }
    });

    // Categories Validation
    const selectedCategories = Object.keys(categoryPrices);
    if (selectedCategories.length === 0) {
      newErrors.categories =
        "At least one category and its price are required.";
    } else {
      selectedCategories.forEach((category) => {
        if (!categoryPrices[category]) {
          newErrors[
            `categoryPrice-${category}`
          ] = `Price for ${category} is required.`;
        }
      });
    }

    // Image and Proof Validation
    if (!hallData.image) newErrors.image = "Hall image is required.";
    if (!hallData.proofOfOwnership)
      newErrors.proofOfOwnership = "Proof of ownership is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const hallOwnerId = localStorage.getItem("hallOwnerId");

      // Step 1: Prepare FormData to upload the proof file
      const proofFormData = new FormData();
      if (hallData.proofOfOwnership) {
        proofFormData.append("file", hallData.proofOfOwnership); // Append proof file
      } else {
        console.error("No proof file selected");
        return;
      }

      // Step 2: Upload proof of ownership file to backend
      const proofResponse = await fetchWithAuth(
        "http://localhost:8080/hallOwner/uploadFileProof",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`, // Pass the token for authentication
          },
          body: proofFormData, // Send proof file as FormData
        }
      );

      if (!proofResponse.ok) {
        throw new Error("Failed to upload proof of ownership");
      }

      const proofResponseText = await proofResponse.text();
      console.log("Proof file uploaded successfully", proofResponseText);

      // Step 3: Prepare FormData to upload images
      const formData = new FormData();
      if (hallData.image && hallData.image.length > 0) {
        for (let i = 0; i < hallData.image.length; i++) {
          const file = hallData.image[i];
          formData.append("images", file); // Append each image as "images"
        }
      } else {
        console.error("No files selected");
        return;
      }

      // Step 4: Upload images to backend
      const uploadResponse = await fetchWithAuth(
        "http://localhost:8080/hallOwner/uploadImageToHall",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`, // Pass the token for authentication
          },
          body: formData, // Send formData with images
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload images");
      }

      const imageUrls = await uploadResponse.text(); // Expect the backend to return a string of image URLs

      // Step 5: Prepare services object
      const servicesObj = {};
      hallData.services.forEach((service) => {
        servicesObj[service.serviceName] = service.servicePrice;
      });

      // Step 6: Prepare hall payload including categories and their prices
      const hallPayload = {
        capacity: hallData.capacity,
        description: hallData.description,
        hallOwner: {
          id: hallOwnerId,
        },
        location: hallData.city,
        name: hallData.name,
        phone: hallData.phone,
        price: 0,
        services: servicesObj,
        longitude: hallData.longitude,
        latitude: hallData.latitude,
        categories: categoryPrices, // Send category prices
        image: imageUrls, // Send the comma-separated image URLs
        proofFile: proofResponseText, // Include the proof of ownership response text
      };

      // Step 7: Add hall API call
      const addHallResponse = await fetchWithAuth(
        "http://localhost:8080/hallOwner/addHall",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(hallPayload),
        }
      );

      if (!addHallResponse.ok) {
        throw new Error("Failed to add hall");
      }

      const addHallData = await addHallResponse.json();
      console.log("Hall added successfully", addHallData);

      // Clear the form after successful submission
      setHallData({
        name: "",
        location: "",
        capacity: "",
        phone: "",
        price: "",
        description: "",
        services: [{ serviceName: "", servicePrice: "" }],
        categories: [],
        latitude: "",
        longitude: "",
        image: null,
        proofOfOwnership: null, // Clear proof file
      });

      setCategoryPrices({}); // Clear category prices
      setIsProcessing(true); // Show processing message
      setSuccessMessage(
        "Your hall is under processing. You will receive an email when approved."
      ); // Success message
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  // Function to handle proof of ownership file upload
  const handleProofFileChange = (e) => {
    setHallData({
      ...hallData,
      proofOfOwnership: e.target.files[0], // Store the selected proof file
    });
  };

  if (!isLoaded) return <div>Loading...</div>;

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
    "Azzun",
    "Beit_Jala",
    "Beit_Sahour",
    "Dura",
    "Halhul",
    "Yatta",
  ];

  return (
    <div className="add-hall-unique-container">
      <h1 className="add-hall-unique-title">{t("add_new_hall")}</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {!isProcessing ? (
        <form className="add-hall-unique-form" onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="add-hall-box">
            <h2 className="section-title-unique">{t("basic_information")}</h2>
  
            {/* Hall Name */}
            <div className="form-group-unique">
              <label htmlFor="name" className="input-label-unique">
                {t("hall_name")}
              </label>
              <input
                type="text"
                id="name"
                className="input-field-unique"
                name="name"
                value={hallData.name}
                onChange={handleInputChange}
                placeholder={t("enter_hall_name")}
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
  
            {/* Capacity */}
            <div className="form-group-unique">
              <label htmlFor="capacity" className="input-label-unique">
                {t("capacity")}
              </label>
              <input
                type="number"
                id="capacity"
                className="input-field-unique"
                name="capacity"
                value={hallData.capacity}
                onChange={handleInputChange}
                placeholder={t("enter_capacity")}
              />
              {errors.capacity && (
                <p className="error-message">{errors.capacity}</p>
              )}
            </div>
  
            {/* Phone */}
            <div className="form-group-unique">
              <label htmlFor="phone" className="input-label-unique">
                {t("phone")}
              </label>
              <input
                type="tel"
                id="phone"
                className="input-field-unique"
                name="phone"
                value={hallData.phone}
                onChange={handleInputChange}
                placeholder={t("enter_phone_number")}
              />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>
  
            {/* Description */}
            <div className="form-group-unique">
              <label htmlFor="description" className="input-label-unique">
                {t("description")}
              </label>
              <textarea
                id="description"
                className="input-textarea-unique"
                name="description"
                value={hallData.description}
                onChange={handleInputChange}
                placeholder={t("enter_description")}
              />
              {errors.description && (
                <p className="error-message">{errors.description}</p>
              )}
            </div>
          </div>
  
          {/* Section 2: Location Information */}
          <div className="add-hall-box">
            <h2 className="section-title-unique">{t("location_information")}</h2>
  
            {/* City Selection Dropdown */}
            <div className="form-group-unique">
              <label htmlFor="city" className="input-label-unique">
                {t("city")}
              </label>
              <select
                id="city"
                className="input-field-unique"
                name="city"
                value={hallData.city}
                onChange={handleInputChange}
              >
                <option value="">{t("select_city")}</option>
                {westBankCities.map((city) => (
                  <option key={city} value={city}>
                    {t(`city_${city.toLowerCase()}`)}
                  </option>
                ))}
              </select>
              {errors.city && <p className="error-message">{errors.city}</p>}
            </div>
  
            {/* Location Search Input */}
            <div className="form-group-unique">
              <label htmlFor="location" className="input-label-unique">
                {t("location")}
              </label>
              <Autocomplete
                onLoad={(autocomplete) => setAutocomplete(autocomplete)}
                onPlaceChanged={handlePlaceSelect}
              >
                <input
                  type="text"
                  id="location"
                  className="input-field-unique"
                  placeholder={t("search_location")}
                />
              </Autocomplete>
            </div>
  
            {/* Google Map */}
            <div className="map-container">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "300px" }}
                center={markerPosition}
                zoom={13}
                onClick={handleMapClick}
                onLoad={(map) => setMap(map)}
              >
                <Marker position={markerPosition} />
              </GoogleMap>
            </div>
  
            {/* Latitude and Longitude */}
            <div className="form-group-unique">
              <label htmlFor="latitude" className="input-label-unique">
                {t("latitude")}
              </label>
              <input
                type="number"
                id="latitude"
                className="input-field-unique"
                name="latitude"
                value={hallData.latitude}
                readOnly
                placeholder={t("selected_latitude")}
              />
            </div>
  
            <div className="form-group-unique">
              <label htmlFor="longitude" className="input-label-unique">
                {t("longitude")}
              </label>
              <input
                type="number"
                id="longitude"
                className="input-field-unique"
                name="longitude"
                value={hallData.longitude}
                readOnly
                placeholder={t("selected_longitude")}
              />
            </div>
  
            {errors.location && (
              <p className="error-message">{errors.location}</p>
            )}
          </div>
  
          {/* Section: Services */}
          <div className="add-hall-box">
            <h2 className="section-title-unique">{t("services")}</h2>
            {hallData.services.map((service, index) => (
              <div key={index} className="dynamic-service-unique">
                <input
                  type="text"
                  className="input-field-unique"
                  value={service.serviceName}
                  onChange={(e) => handleServiceChange(e, index, "serviceName")}
                  placeholder={`${t("service")} #${index + 1}`}
                />
                <input
                  type="number"
                  className="input-field-unique"
                  value={service.servicePrice}
                  onChange={(e) =>
                    handleServiceChange(e, index, "servicePrice")
                  }
                  placeholder={t("service_price")}
                />
                <button
                  type="button"
                  className="remove-service-btn-unique"
                  onClick={() => removeService(index)}
                >
                  {t("remove_service")}
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-service-btn-unique"
              onClick={addService}
            >
              {t("add_service")}
            </button>
          </div>
  
          {/* Section 4: Categories with Price Inputs */}
          <div className="add-hall-box">
            <h2 className="section-title-unique">{t("categories")}</h2>
            <div className="category-checkboxes-unique">
              {["WEDDINGS", "BIRTHDAYS", "MEETINGS", "PARTIES", "FUNERALS"].map(
                (category) => (
                  <div key={category} className="checkbox-item-unique">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      value={category}
                      onChange={handleCategoryChange}
                      checked={categoryPrices.hasOwnProperty(category)}
                    />
                    <label htmlFor={`category-${category}`}>
                      {t(`category_${category.toLowerCase()}`)}
                    </label>
  
                    {/* Show price input if category is selected */}
                    {categoryPrices.hasOwnProperty(category) && (
                      <input
                        type="number"
                        className="input-field-unique"
                        value={categoryPrices[category]}
                        onChange={(e) =>
                          handleCategoryPriceChange(e, category)
                        }
                        placeholder={t("enter_price", {
                          category: t(`category_${category.toLowerCase()}`),
                        })}
                      />
                    )}
                    {errors[`categoryPrice-${category}`] && (
                      <p className="error-message">
                        {errors[`categoryPrice-${category}`]}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
            {errors.categories && (
              <p className="error-message">{errors.categories}</p>
            )}
          </div>
  
          {/* Section 5: Upload Image */}
          <div className="add-hall-box">
            <h2 className="section-title-unique">{t("upload_image")}</h2>
            <div className="form-group-unique">
              <input
                type="file"
                className="choosefile-input-unique"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              {errors.image && <p className="error-message">{errors.image}</p>}
            </div>
          </div>
  
          {/* Section 6: Upload Proof of Ownership */}
          <div className="add-hall-box">
            <h2 className="section-title-unique">{t("upload_proof_of_ownership")}</h2>
            <div className="form-group-unique">
              <input
                type="file"
                className="choosefile-input-unique"
                accept="application/pdf,image/*"
                onChange={handleProofFileChange}
              />
              {errors.proofOfOwnership && (
                <p className="error-message">{errors.proofOfOwnership}</p>
              )}
            </div>
          </div>
  
          <button type="submit" className="submit-btn-unique">
            {t("submit")}
          </button>
        </form>
      ) : (
        <div>
          <p>{t("hall_under_processing")}</p>
        </div>
      )}
    </div>
  );
  
};

export default AddNewHall;
