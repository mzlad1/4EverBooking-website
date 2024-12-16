import React, { useState, useEffect } from "react";
import "./ReservedHalls.css";
import { fetchWithAuth } from "../../apiClient";
import { useTranslation } from "react-i18next";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import { useHistory } from "react-router-dom";

const ReservedHalls = () => {
  const { t } = useTranslation();
  const history = useHistory(); // To navigate to feedback page
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceHeaders, setServiceHeaders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchReservedHalls = async (userId, role) => {
      try {
        const token = localStorage.getItem("accessToken");
        let apiUrl = "";

        if (role === "CUSTOMER") {
          apiUrl = `http://localhost:8080/customer/getAll?page=${page}&size=${rowsPerPage}&customerId=${userId}`;
        } else if (role === "HALL_OWNER") {
          apiUrl = `http://localhost:8080/hallOwner/getReservedHalls?page=${page}&size=${rowsPerPage}&ownerId=${userId}`;
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
        setTotalPages(data.totalPages);
        setLoading(false);

        const services = new Set();
        data.content.forEach((hall) => {
          Object.keys(hall.services).forEach((service) =>
            services.add(service)
          );
        });
        setServiceHeaders([...services]);
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
      setError(t("user_id_not_found"));
      setLoading(false);
    } else {
      fetchReservedHalls(userId, role);
    }
  }, [page, t]);

  const translateCategory = (category) => {
    if (!category) return t("N/A");
    return t(category.toLowerCase()) || category;
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Navigate to Feedback Page
  const handleFeedbackClick = (hallId) => {
    history.push(`/feedback/${hallId}`);
  };

  const checkFeedbackAvailability = (endTime) => {
    const today = new Date();
    const reservationEnd = new Date(endTime);
    return today > reservationEnd; // Check if today is after the reservation end date
  };

  if (loading) return <p>{t("loading")}</p>;
  if (error)
    return (
      <p>
        {t("error")}: {error}
      </p>
    );

  return (
    <div className="reserved-halls-container-modern">
      <h1 className="reserved-halls-title-modern">{t("reserved_halls")}</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("hall_name")}
              </TableCell>
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("category")}
              </TableCell>
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("time")}
              </TableCell>
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("end_time")}
              </TableCell>
              {serviceHeaders.map((service, index) => (
                <TableCell
                  sx={{ backgroundColor: "#cba36b", color: "white" }}
                  key={index}
                >
                  {service.charAt(0).toUpperCase() + service.slice(1)}{" "}
                  {t("cost")}
                </TableCell>
              ))}
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("total_price")}
              </TableCell>
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("feedback")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {halls.map((hall, index) => (
              <TableRow key={index}>
                <TableCell>{hall.hallName}</TableCell>
                <TableCell>{translateCategory(hall.category)}</TableCell>
                <TableCell>{new Date(hall.time).toLocaleString()}</TableCell>
                <TableCell>
                  {hall.endTime
                    ? new Date(hall.endTime).toLocaleString()
                    : t("N/A")}
                </TableCell>
                {serviceHeaders.map((service, index) => (
                  <TableCell key={index}>
                    {hall.services[service] || t("N/A")}
                  </TableCell>
                ))}
                <TableCell>{hall.totalPrice}</TableCell>
                <TableCell>
                  {hall.feedbackSent ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Feedback Sent
                    </span>
                  ) : hall.endTime &&
                    checkFeedbackAvailability(hall.endTime) ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleFeedbackClick(hall.hallId)}
                    >
                      {t("give_feedback")}
                    </Button>
                  ) : (
                    <span>{t("feedback_available_after")}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="pagination-controls">
        <Pagination
          count={totalPages}
          page={page}
          variant="outlined"
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default ReservedHalls;
