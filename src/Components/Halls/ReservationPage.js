import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import DatePicker from "react-datepicker"; // Import React Date Picker
import { useTranslation } from "react-i18next";

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
import { CircularProgress } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51PluNHFNc7gJPoUc9XnL6UVtt25ebwD23sv8p2JR5tu74vgYjkJ45hDSoyx1OfUF2WJetMUziuq7lJaLk1jH9pny0041T40ceT"
);

const ReservationPage = () => {
  const location = useLocation();
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();

  const reservationDetails =
    JSON.parse(localStorage.getItem("reservationDetails")) || location.state;
  const { t } = useTranslation();

  const {
    hallId,
    customerId,
    totalPrice,
    selectedServices,
    selectedCategory, // Ensure this is correctly destructured
    fromDate,
    toDate, // Ensure this is correctly destructured
  } = reservationDetails || {};

  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [connectedAccountId, setConnectedAccountId] = useState("");

  useEffect(() => {
    if (
      !hallId ||
      !customerId ||
      !totalPrice ||
      !selectedServices ||
      !fromDate
    ) {
      history.push("/hall-details");
    }
  }, [hallId, customerId, totalPrice, selectedServices, fromDate, history]);

  useEffect(() => {
    const fetchConnectedAccountId = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/customer/connectedAccountId/${hallId}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch connectedAccountId: ${response.status}`
          );
        }

        const accountId = await response.text();
        setConnectedAccountId(accountId);
        console.log("Connected Account ID:", accountId);
      } catch (error) {
        console.error("Error fetching connectedAccountId:", error);
        setErrors({
          payment: "Failed to retrieve payment account. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedAccountId();
  }, [hallId]);

  useEffect(() => {
    if (connectedAccountId) {
      const createPaymentIntent = async () => {
        try {
          setLoading(true);

          const token = localStorage.getItem("accessToken");
          if (!token) {
            throw new Error("Authorization token is missing.");
          }

          const response = await fetch(
            "http://localhost:8080/payments/create-payment-intent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
              body: JSON.stringify({
                amount: totalPrice * 100, // Convert to cents
                currency: "usd",
                connectedAccountId: connectedAccountId,
              }),
            }
          );

          const result = await response.json();
          console.log("Payment Intent Response:", result);

          if (!result.clientSecret || result.clientSecret === "") {
            throw new Error("Client Secret is missing or invalid.");
          }

          setClientSecret(result.clientSecret);
          console.log("Client Secret Set:", result.clientSecret);
        } catch (error) {
          console.error("Error creating payment intent:", error);
          setErrors({
            payment: "Failed to initialize payment. Please try again later.",
          });
        } finally {
          setLoading(false);
        }
      };

      createPaymentIntent();
    }
  }, [connectedAccountId, totalPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress({
      ...billingAddress,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isConfirmed = window.confirm(
      "Are you sure you want to confirm the reservation?"
    );
    if (!isConfirmed) {
      setLoading(false);
      return;
    }

    const newErrors = {};
    if (!billingAddress.fullName) newErrors.fullName = "Full name is required.";
    if (!billingAddress.address) newErrors.address = "Address is required.";
    if (!billingAddress.phoneNumber || billingAddress.phoneNumber.length < 10)
      newErrors.phoneNumber = "Valid phone number is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && stripe && elements) {
      try {
        const cardElement = elements.getElement(CardElement);

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: billingAddress.fullName,
                address: { line1: billingAddress.address },
                phone: billingAddress.phoneNumber,
              },
            },
          }
        );

        if (error) {
          console.error("Payment error:", error.message);
          setErrors({ payment: error.message });
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          console.log("Payment succeeded:", paymentIntent);

          const servicesObject = selectedServices.reduce((acc, service) => {
            acc[service.name] = service.price;
            return acc;
          }, {});

          const fromDateObject = new Date(fromDate);
          fromDateObject.setHours(12, 0, 0, 0); // Adjust to noon to avoid timezone issues

          const toDateObject = toDate
            ? new Date(toDate).setHours(12, 0, 0, 0)
            : fromDateObject;

          const reservationData = {
            hallId,
            customerId,
            time: new Date(fromDateObject).toISOString(),
            endTime: new Date(toDateObject).toISOString(),
            selectedCategory,
            services: servicesObject,
          };

          try {
            const response = await fetchWithAuth(
              "http://localhost:8080/customer/reserveHall",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
                body: JSON.stringify(reservationData),
              }
            );

            if (response.ok) {
              const result = await response.json();
              console.log("Reservation successful: ", result);

              history.push({
                pathname: "/reservation-success",
                state: { message: "Reservation successful!", goToHalls: true },
              });
            } else {
              const errorText = await response.text();
              console.error("Reservation failed:", errorText);
              setErrors({
                payment: "Reservation failed. Please try again later.",
              });
            }
          } catch (error) {
            console.error("Reservation error:", error);
            setErrors({
              payment: "An error occurred while processing the reservation.",
            });
          }
        }
      } catch (error) {
        console.error("Error confirming payment:", error);
        setErrors({ payment: "Payment failed. Please try again." });
      }
    }

    setLoading(false);
  };

  return (
    <div className="reservation-confirmation-page">
      {loading && (
        <div className="loading-overlay">
          <CircularProgress size={80} />
        </div>
      )}
      <h1 className="reservation-fade-in-title">
        {t("reservation_confirmation")}
      </h1>
      <div className="reservation-total-price-box reservation-fade-in">
        <p>{t("total_price")}:</p>
        <h2>${totalPrice}</h2>
      </div>

      <form onSubmit={handleSubmit} className="reservation-form" noValidate>
        <div className="reservation-form-boxes reservation-fade-in">
          <div className="reservation-billing-box">
            <h2>{t("billing_information")}</h2>
            <div className="reservation-form-group">
              <label>{t("full_name")}:</label>
              <div className="reservation-input-with-icon">
                <FontAwesomeIcon icon={faUser} />
                <input
                  type="text"
                  name="fullName"
                  value={billingAddress.fullName}
                  onChange={handleInputChange}
                  placeholder={t("full_name")}
                />
              </div>
              {errors.fullName && (
                <p className="reservation-error-message">{errors.fullName}</p>
              )}
            </div>
            <div className="reservation-form-group">
              <label>{t("address")}:</label>
              <div className="reservation-input-with-icon">
                <FontAwesomeIcon icon={faHome} />
                <input
                  type="text"
                  name="address"
                  value={billingAddress.address}
                  onChange={handleInputChange}
                  placeholder={t("address")}
                />
              </div>
              {errors.address && (
                <p className="reservation-error-message">{errors.address}</p>
              )}
            </div>
          </div>
          <div className="reservation-payment-box">
            <h2>{t("payment_information")}</h2>
            <div className="reservation-form-group">
              <label>{t("card_details")}:</label>
              <CardElement
                className="reservation-card-element"
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#333",
                      "::placeholder": {
                        color: "#aaa",
                      },
                    },
                    invalid: {
                      color: "#e53935",
                    },
                  },
                }}
              />

              {errors.payment && (
                <p className="reservation-error-message">{errors.payment}</p>
              )}
            </div>
            <div className="reservation-form-group">
              <label>{t("phone_number")}:</label>
              <div className="reservation-input-with-icon">
                <FontAwesomeIcon icon={faPhone} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={billingAddress.phoneNumber}
                  onChange={handleInputChange}
                  placeholder={t("phone_number")}
                />
              </div>
              {errors.phoneNumber && (
                <p className="reservation-error-message">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="reservation-button-container reservation-fade-in">
          <button
            type="submit"
            className="reservation-submit-button"
            disabled={!stripe || !elements || loading}
          >
            {t("confirm_reservation")}
          </button>
          <button
            type="button"
            className="reservation-cancel-button"
            onClick={() => history.goBack()}
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};

const ReservationPageWithStripe = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language; // Get the current language (e.g., 'en', 'ar')

  return (
    <Elements
      stripe={stripePromise}
      options={{
        locale: currentLanguage, // Dynamically set the locale for Stripe elements
      }}
    >
      <ReservationPage />
    </Elements>
  );
};

export default ReservationPageWithStripe;
