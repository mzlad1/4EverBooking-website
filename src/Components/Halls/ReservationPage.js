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

// Import a spinner from a library or create your own
import { CircularProgress } from "@mui/material";

const ReservationPage = () => {
  const location = useLocation();
  const history = useHistory();

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
  } = reservationDetails || {};

  useEffect(() => {
    if (
      !hallId ||
      !customerId ||
      !totalPrice ||
      !selectedServices ||
      !selectedCategory ||
      !fromDate
    ) {
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

  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: null,
    cvv: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Loading state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress({
      ...billingAddress,
      [name]: value,
    });
  };

  const handleCardNumberChange = (e) => {
    const { value } = e.target;
    const formattedValue = value.replace(/\D/g, "").slice(0, 16);
    setPaymentInfo({ ...paymentInfo, cardNumber: formattedValue });
  };

  const handleCvvChange = (e) => {
    const { value } = e.target;
    const formattedValue = value.replace(/\D/g, "").slice(0, 3);
    setPaymentInfo({ ...paymentInfo, cvv: formattedValue });
  };

  const getServiceObject = (servicesArray) => {
    const servicesObject = {};
    servicesArray.forEach((service) => {
      servicesObject[service.name] = service.price;
    });
    return servicesObject;
  };

  const toUTCDate = (date) => {
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    return utcDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader

    const isConfirmed = window.confirm(
      "Are you sure you want to confirm the reservation?"
    );
    if (!isConfirmed) {
      setLoading(false); // Hide loader if canceled
      return;
    }

    const newErrors = {};
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

    if (Object.keys(newErrors).length === 0) {
      const servicesObject = getServiceObject(selectedServices);
      const fromDateObject = toUTCDate(new Date(fromDate));
      const toDateObject = toDate
        ? toUTCDate(new Date(toDate))
        : fromDateObject;

      const reservationData = {
        hallId,
        customerId,
        time: fromDateObject.toISOString(),
        endTime: toDateObject.toISOString(),
        selectedCategory,
        services: servicesObject,
        expiryDate: paymentInfo.expiryDate
          ? paymentInfo.expiryDate.toISOString()
          : null,
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

        history.push({
          pathname: "/reservation-success",
          state: { message: "Reservation successful!", goToHalls: true },
        });
      } catch (error) {
        console.error("Reservation failed: ", error);
      } finally {
        setLoading(false); // Hide loader
      }
    } else {
      setLoading(false); // Hide loader if errors
    }
  };

  const handleCancel = () => {
    history.goBack();
    localStorage.removeItem("reservationDetails");
  };
  return (
    <div className="reservation-confirmation-page">
      {loading && (
        <div className="loading-overlay">
          <CircularProgress size={80} />
        </div>
      )}
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
