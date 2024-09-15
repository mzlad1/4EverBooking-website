import React, { useState, useEffect } from "react";
import "./ReservedHalls.css";
import { fetchWithAuth } from "../../apiClient"; // Import the fetchWithAuth function

import { useTranslation } from "react-i18next"; // Import useTranslation hook

const ReservedHalls = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceHeaders, setServiceHeaders] = useState([]);

  useEffect(() => {
    const fetchReservedHalls = async (userId, role) => {
      try {
        const token = localStorage.getItem("accessToken");
        let apiUrl = "";

        if (role === "CUSTOMER") {
          apiUrl = `http://localhost:8080/customer/getAll?page=1&size=10&customerId=${userId}`;
        } else if (role === "HALL_OWNER") {
          apiUrl = `http://localhost:8080/hallOwner/getReservedHalls?page=1&size=10&ownerId=${userId}`;
        }

        const response = await fetchWithAuth(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reserved halls");
        }

        const data = await response.json();
        setHalls(data.content);

        // Extract unique services from the fetched halls
        const services = new Set();
        data.content.forEach((hall) => {
          Object.keys(hall.services).forEach((service) =>
            services.add(service)
          );
        });

        setServiceHeaders([...services]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const userId =
      localStorage.getItem("role") === "HALL_OWNER"
        ? localStorage.getItem("hallOwnerId")
        : localStorage.getItem("customerId");
    const role = localStorage.getItem("role");

    if (!userId) {
      setError(t("user_id_not_found")); // Error if user ID is missing
      setLoading(false);
    } else {
      fetchReservedHalls(userId, role);
    }
  }, [t]);

  if (loading) return <p>{t("loading")}</p>; // Translated loading message
  if (error)
    return (
      <p>
        {t("error")}: {error}
      </p>
    ); // Translated error message

  const translateCategory = (category) => {
    if (!category) return t("N/A"); // Translate "N/A" if no category is available
    return t(category.toLowerCase()) || category; // Translate known categories or return original
  };

  return (
    <div className="reserved-halls-container-modern">
      <h1 className="reserved-halls-title-modern">{t("reserved_halls")}</h1>{" "}
      {/* Translated "Reserved Halls" */}
      <table className="reserved-halls-table-modern">
        <thead className="reserved-halls-thead-modern">
          <tr className="reserved-halls-header-row-modern">
            <th>{t("hall_name")}</th> {/* Translated "Hall Name" */}
            <th>{t("category")}</th> {/* Translated "Category" */}
            <th>{t("time")}</th> {/* Translated "Time" */}
            <th>{t("end_time")}</th> {/* Translated "End Time" */}
            {serviceHeaders.map((service, index) => (
              <th key={index}>
                {service.charAt(0).toUpperCase() + service.slice(1)} {t("cost")}{" "}
                {/* Translated "Cost" */}
              </th>
            ))}
            <th>{t("total_price")}</th> {/* Translated "Total Price" */}
          </tr>
        </thead>
        <tbody className="reserved-halls-tbody-modern">
          {halls.map((hall, index) => (
            <tr key={index} className="reserved-halls-row-modern">
              <td>{hall.hallName}</td>
              <td>{translateCategory(hall.category)}</td>{" "}
              {/* Translated category */}
              <td>{new Date(hall.time).toLocaleString()}</td>
              <td>
                {hall.endTime
                  ? new Date(hall.endTime).toLocaleString()
                  : t("N/A")}
              </td>{" "}
              {/* Translated "N/A" */}
              {serviceHeaders.map((service, index) => (
                <td key={index}>{hall.services[service] || t("N/A")}</td>
              ))}
              <td>{hall.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservedHalls;
