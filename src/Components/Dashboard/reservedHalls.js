import React, { useState, useEffect } from "react";
import "./ReservedHalls.css";
import { fetchWithAuth } from "../../apiClient"; // Import the fetchWithAuth function
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination"; // Import Pagination from Material-UI

const ReservedHalls = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceHeaders, setServiceHeaders] = useState([]);
  const [page, setPage] = useState(1); // Current page state
  const [totalPages, setTotalPages] = useState(1); // Total pages state
  const rowsPerPage = 10; // Rows per page

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
        setTotalPages(data.totalPages); // Assuming the API returns total pages
        setLoading(false);

        // Extract unique services from the fetched halls
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
      setError(t("user_id_not_found")); // Error if user ID is missing
      setLoading(false);
    } else {
      fetchReservedHalls(userId, role);
    }
  }, [page, t]); // Refetch data when the page changes

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

  const handlePageChange = (event, value) => {
    setPage(value); // Update the page when pagination controls are clicked
  };

  return (
    <div className="reserved-halls-container-modern">
      <h1 className="reserved-halls-title-modern">{t("reserved_halls")}</h1>{" "}
      {/* Translated "Reserved Halls" */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("hall_name")}
              </TableCell>{" "}
              {/* Translated "Hall Name" */}
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("category")}
              </TableCell>{" "}
              {/* Translated "Category" */}
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("time")}
              </TableCell>{" "}
              {/* Translated "Time" */}
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("end_time")}
              </TableCell>{" "}
              {/* Translated "End Time" */}
              {serviceHeaders.map((service, index) => (
                <TableCell
                  sx={{ backgroundColor: "#cba36b", color: "white" }}
                  key={index}
                >
                  {service.charAt(0).toUpperCase() + service.slice(1)}{" "}
                  {t("cost")} {/* Translated "Cost" */}
                </TableCell>
              ))}
              <TableCell sx={{ backgroundColor: "#cba36b", color: "white" }}>
                {t("total_price")}
              </TableCell>{" "}
              {/* Translated "Total Price" */}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Custom Pagination */}
      <div className="pagination-controls">
        <Pagination
          count={totalPages} // Total number of pages
          page={page} // Current page number
          variant="outlined"
          onChange={handlePageChange} // Function to handle page change
          color="primary" // Color for pagination controls
        />
      </div>
    </div>
  );
};

export default ReservedHalls;
