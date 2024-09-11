import React, { useState } from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import "./AddNewHall.css";

const libraries = ["places"]; // Required for Places Autocomplete

const AddNewHall = () => {
  const [hallData, setHallData] = useState({
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
  });

  const [successMessage, setSuccessMessage] = useState(""); // To store success message
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const accessToken = localStorage.getItem("accessToken");
      const hallOwnerId = localStorage.getItem("hallOwnerId");

      // Step 1: Prepare FormData to upload images
      const formData = new FormData();

      // Check if hallData.image exists and is an array
      if (hallData.image && hallData.image.length > 0) {
        for (let i = 0; i < hallData.image.length; i++) {
          const file = hallData.image[i];
          formData.append("images", file); // Append each image as "images"
        }
      } else {
        console.error("No files selected");
        return;
      }

      // Step 2: Upload images to backend
      const uploadResponse = await fetch(
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

      // Step 3: Prepare services object
      const servicesObj = {};
      hallData.services.forEach((service) => {
        servicesObj[service.serviceName] = service.servicePrice;
      });

      // Step 4: Prepare hall payload including categories and their prices
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
      };

      // Step 5: Add hall API call
      const addHallResponse = await fetch(
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
      });

      // Clear the category prices and show success message
      setCategoryPrices({});
      setSuccessMessage("Hall added successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
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
      <h1 className="add-hall-unique-title">Add a New Hall</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form className="add-hall-unique-form" onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div className="add-hall-box">
          <h2 className="section-title-unique">Basic Information</h2>
          <div className="form-group-unique">
            <label htmlFor="name" className="input-label-unique">
              Hall Name
            </label>
            <input
              type="text"
              id="name"
              className="input-field-unique"
              name="name"
              value={hallData.name}
              onChange={handleInputChange}
              placeholder="Enter hall name"
            />
          </div>

          <div className="form-group-unique">
            <label htmlFor="capacity" className="input-label-unique">
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              className="input-field-unique"
              name="capacity"
              value={hallData.capacity}
              onChange={handleInputChange}
              placeholder="Enter capacity"
            />
          </div>

          <div className="form-group-unique">
            <label htmlFor="phone" className="input-label-unique">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              className="input-field-unique"
              name="phone"
              value={hallData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group-unique">
            <label htmlFor="description" className="input-label-unique">
              Description
            </label>
            <textarea
              id="description"
              className="input-textarea-unique"
              name="description"
              value={hallData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
            />
          </div>
        </div>

        {/* Section 2: Location Information */}
        <div className="add-hall-box">
          <h2 className="section-title-unique">Location Information</h2>

          {/* City Selection Dropdown */}
          <div className="form-group-unique">
            <label htmlFor="city" className="input-label-unique">
              City
            </label>
            <select
              id="city"
              className="input-field-unique"
              name="city"
              value={hallData.city}
              onChange={handleInputChange}
            >
              <option value="">Select a city</option>
              {westBankCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Location Search Input */}
          <div className="form-group-unique">
            <label htmlFor="location" className="input-label-unique">
              Location
            </label>
            <Autocomplete
              onLoad={(autocomplete) => setAutocomplete(autocomplete)}
              onPlaceChanged={handlePlaceSelect}
            >
              <input
                type="text"
                id="location"
                className="input-field-unique"
                placeholder="Search location"
              />
            </Autocomplete>
          </div>

          {/* Google Map Section */}
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

          <div className="form-group-unique">
            <label htmlFor="latitude" className="input-label-unique">
              Latitude
            </label>
            <input
              type="number"
              id="latitude"
              className="input-field-unique"
              name="latitude"
              value={hallData.latitude}
              readOnly
              placeholder="Selected latitude"
            />
          </div>

          <div className="form-group-unique">
            <label htmlFor="longitude" className="input-label-unique">
              Longitude
            </label>
            <input
              type="number"
              id="longitude"
              className="input-field-unique"
              name="longitude"
              value={hallData.longitude}
              readOnly
              placeholder="Selected longitude"
            />
          </div>
        </div>

        {/* Section 3: Services */}
        <div className="add-hall-box">
          <h2 className="section-title-unique">Services</h2>
          {hallData.services.map((service, index) => (
            <div key={index} className="dynamic-service-unique">
              <input
                type="text"
                className="input-field-unique"
                value={service.serviceName}
                onChange={(e) => handleServiceChange(e, index, "serviceName")}
                placeholder={`Service #${index + 1}`}
              />
              <input
                type="number"
                className="input-field-unique"
                value={service.servicePrice}
                onChange={(e) => handleServiceChange(e, index, "servicePrice")}
                placeholder="Service Price"
              />
              <button
                type="button"
                className="remove-service-btn-unique"
                onClick={() => removeService(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-service-btn-unique"
            onClick={addService}
          >
            Add Service
          </button>
        </div>

        {/* Section 4: Categories with Price Inputs */}
        <div className="add-hall-box">
          <h2 className="section-title-unique">Categories</h2>
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
                  <label htmlFor={`category-${category}`}>{category}</label>

                  {/* Show price input if category is selected */}
                  {categoryPrices.hasOwnProperty(category) && (
                    <input
                      type="number"
                      className="input-field-unique"
                      value={categoryPrices[category]}
                      onChange={(e) => handleCategoryPriceChange(e, category)}
                      placeholder={`Enter price for ${category}`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Section 5: Upload Image */}
        <div className="add-hall-box">
          <h2 className="section-title-unique">Upload Image</h2>
          <div className="form-group-unique">
            <input
              type="file"
              className="choosefile-input-unique"
              multiple
              accept="image/*,video/*" // Only accept image and video formats
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn-unique">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddNewHall;
