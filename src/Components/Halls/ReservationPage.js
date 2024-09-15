import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import DatePicker from "react-datepicker"; // Import React Date Picker
import "react-datepicker/dist/react-datepicker.css"; // Import Date Picker styles
import "./reservation.css"; // Custom CSS for styling the form
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithAuth } from "../../apiClient"; // Import the fetchWithAuth function

import {
  faUser,
  faHome,
  faPhone,
  faCreditCard,
  faCalendarAlt,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

const ReservationPage = () => {
  const location = useLocation();
  const history = useHistory(); // For navigating

  // Try to get reservation details from localStorage or location.state
  const reservationDetails =
    JSON.parse(localStorage.getItem("reservationDetails")) || location.state;

  const {
    hallId,
    customerId,
    totalPrice,
    selectedServices,
    selectedCategory,
    fromDate,
    toDate,
  } = reservationDetails || {}; // Use reservation details or destructure empty object

  // Redirect to HallDetailsPage if reservation details are missing
  useEffect(() => {
    if (
      !hallId ||
      !customerId ||
      !totalPrice ||
      !selectedServices ||
      !selectedCategory ||
      !fromDate
    ) {
      // If required details are missing, redirect to HallDetailsPage
      history.push("/hall-details");
    }
  }, [
    hallId,
    customerId,
    totalPrice,
    selectedServices,
    selectedCategory,
    fromDate,
    history,
  ]);

  // Rest of your component code remains the same

  // Form state for billing information
  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
  });

  // State for payment information
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: null, // Use null for DatePicker
    cvv: "",
  });

  // State for error messages
  const [errors, setErrors] = useState({});

  // Handle billing address input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress({
      ...billingAddress,
      [name]: value,
    });
  };

  // Handle credit card input and format to accept max 16 digits
  const handleCardNumberChange = (e) => {
    const { value } = e.target;
    const formattedValue = value.replace(/\D/g, "").slice(0, 16); // Allow only digits and max length 16
    setPaymentInfo({ ...paymentInfo, cardNumber: formattedValue });
  };

  // Handle CVV input and restrict to max 3 digits
  const handleCvvChange = (e) => {
    const { value } = e.target;
    const formattedValue = value.replace(/\D/g, "").slice(0, 3); // Max length 3
    setPaymentInfo({ ...paymentInfo, cvv: formattedValue });
  };

  // Create a service object where service names map to their prices
  const getServiceObject = (servicesArray) => {
    const servicesObject = {};
    servicesArray.forEach((service) => {
      servicesObject[service.name] = service.price; // Assuming service is an object with `name` and `price`
    });
    console.log("Selected Services: ", servicesObject);
    return servicesObject;
  };

  // Form submission and validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to confirm the reservation?"
    );
    if (!isConfirmed) {
      return; // If user cancels, don't proceed
    }

    const newErrors = {};

    // Basic validation
    if (!billingAddress.fullName) newErrors.fullName = "Full name is required.";
    if (!billingAddress.address) newErrors.address = "Address is required.";
    if (!billingAddress.phoneNumber || billingAddress.phoneNumber.length < 10)
      newErrors.phoneNumber = "Valid phone number is required.";
    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 16)
      newErrors.cardNumber = "Valid credit card number is required.";
    if (!paymentInfo.expiryDate)
      newErrors.expiryDate = "Valid expiry date is required (MM/YY).";
    if (!paymentInfo.cvv || paymentInfo.cvv.length !== 3)
      newErrors.cvv = "Valid 3-digit CVV is required.";

    setErrors(newErrors);

    // If no errors, proceed with the API call
    if (Object.keys(newErrors).length === 0) {
      console.log("Billing Info: ", billingAddress);
      console.log("Payment Info: ", paymentInfo);
      console.log("Total Price: ", totalPrice);

      const servicesObject = getServiceObject(selectedServices);

      // Prepare the request payload
      const reservationData = {
        hallId,
        customerId,
        time: fromDate.toISOString(),
        endTime: toDate ? toDate.toISOString() : fromDate.toISOString(),
        selectedCategory,
        services: servicesObject,
        expiryDate: paymentInfo.expiryDate
          ? paymentInfo.expiryDate.toISOString()
          : null, // Send expiry date as ISO string
      };

      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/customer/reserveHall",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify(reservationData),
          }
        );

        const result = await response.json();
        console.log("Reservation successful: ", result);

        // Redirect on successful reservation
        history.push({
          pathname: "/reservation-success",
          state: { message: "Reservation successful!", goToHalls: true },
        });
      } catch (error) {
        console.error("Reservation failed: ", error);
      }
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    history.goBack(); // Navigate to the previous page
    localStorage.removeItem("reservationDetails"); // Clear reservation details
  };

  return (
    <div className="reservation-confirmation-page">
      <h1 className="reservation-fade-in-title">Reservation Confirmation</h1>

      <div className="reservation-total-price-box reservation-fade-in">
        <p>Total Price:</p>
        <h2>${totalPrice}</h2>
      </div>

      <form onSubmit={handleSubmit} className="reservation-form" noValidate>
        <div className="reservation-form-boxes reservation-fade-in">
          <div className="reservation-billing-box">
            <h2>Billing Information</h2>
            <div className="reservation-form-group">
              <label>Full Name:</label>
              <div className="reservation-input-with-icon">
                <FontAwesomeIcon icon={faUser} />
                <input
                  type="text"
                  name="fullName"
                  value={billingAddress.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="reservation-error-message">{errors.fullName}</p>
              )}
            </div>

            <div className="reservation-form-group">
              <label>Address:</label>
              <div className="reservation-input-with-icon">
                <FontAwesomeIcon icon={faHome} />
                <input
                  type="text"
                  name="address"
                  value={billingAddress.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, Country"
                />
              </div>
              {errors.address && (
                <p className="reservation-error-message">{errors.address}</p>
              )}
            </div>

            <div className="reservation-form-group">
              <label>Phone Number:</label>
              <div className="reservation-input-with-icon">
                <FontAwesomeIcon icon={faPhone} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={billingAddress.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                />
              </div>
              {errors.phoneNumber && (
                <p className="reservation-error-message">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="reservation-payment-box">
            <h2>Payment Information</h2>

            <div className="reservation-form-group">
              <label>Credit Card Number:</label>
              <div className="reservation-input-with-icon">
                <FontAwesomeIcon icon={faCreditCard} />
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9123 4567"
                  maxLength="16"
                />
              </div>
              {errors.cardNumber && (
                <p className="reservation-error-message">{errors.cardNumber}</p>
              )}
            </div>

            <div className="reservation-form-group">
              <label>Expiry Date:</label>
              <div className="reservation-input-with-icon-date">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <DatePicker
                  selected={paymentInfo.expiryDate}
                  onChange={(date) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      expiryDate: date,
                    })
                  }
                  dateFormat="MM/yy"
                  showMonthYearPicker
                  placeholderText="MM/YY"
                  className="reservation-datepicker-input"
                />
              </div>
              {errors.expiryDate && (
                <p className="reservation-error-message">{errors.expiryDate}</p>
              )}
            </div>

            <div className="reservation-form-group">
              <label>CVV:</label>
              <div className="reservation-input-with-icon">
                <FontAwesomeIcon icon={faLock} />
                <input
                  type="text"
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={handleCvvChange}
                  placeholder="***"
                  maxLength="3"
                />
              </div>
              {errors.cvv && (
                <p className="reservation-error-message">{errors.cvv}</p>
              )}
            </div>
          </div>
        </div>

        <div className="reservation-button-container reservation-fade-in">
          <button type="submit" className="reservation-submit-button">
            Confirm Reservation
          </button>
          <button
            type="button"
            className="reservation-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationPage;
