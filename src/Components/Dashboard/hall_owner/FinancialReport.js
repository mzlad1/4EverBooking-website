import React, { useEffect, useState } from "react";
import { useAuth } from "../../../Context/AuthContext"; // Assuming you need the token from AuthContext
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css"; // Import react-pdf styles
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import "./financial.css";
import { fetchWithAuth } from "../../../apiClient"; // Import the fetchWithAuth function

const FinancialReport = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFilename, setPdfFilename] = useState(null); // To store the filename
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchFinancialReport = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // Get access token from localStorage
        const ownerId = localStorage.getItem("hallOwnerId"); // Fetch owner ID from localStorage

        if (!ownerId) {
          throw new Error("Owner ID not found");
        }

        // API call to get the PDF filename from the report URL
        const response = await fetchWithAuth(
          `http://localhost:8080/hallOwner/hallsReservationReport/${ownerId}`, // Use dynamic owner ID
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch financial report");
        }

        const pdfUrl = await response.text(); // Response body contains the PDF URL
        const filename = pdfUrl.split("/").pop(); // Extract the filename from the URL
        setPdfUrl(pdfUrl);
        setPdfFilename(filename); // Store the filename for download
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialReport();
  }, [isLoggedIn]);

  // Function to handle direct download from the second API
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // Get access token from localStorage

      // API call to download the file using the filename
      const downloadUrl = `http://localhost:8080/hallOwner/download/${pdfFilename}`; // Use the filename for the download API

      const response = await fetchWithAuth(downloadUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`, // Include Authorization header
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob(); // Get the file as a blob
      const url = window.URL.createObjectURL(blob); // Create a temporary URL for the file
      const link = document.createElement("a"); // Create a temporary download link
      link.href = url;
      link.setAttribute("download", pdfFilename); // Set the file name dynamically
      document.body.appendChild(link);
      link.click(); // Trigger the download
      link.remove(); // Clean up the link
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  if (loading) {
    return (
      <Container className="financial-report-container" align="center">
        <CircularProgress /> {/* Material-UI loading spinner */}
        <Typography variant="h6" style={{ marginTop: "20px" }}>
          Loading Financial Report...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="financial-report-container" align="center">
        <Alert severity="error">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="financial-report-container" align="center">
      <Typography variant="h4" gutterBottom>
        Financial Report
      </Typography>

      {pdfUrl ? (
        <>
          {/* Render the PDF using react-pdf-viewer */}
          <div className="pdf-viewer">
            <Worker
              workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
            >
              <Viewer fileUrl={pdfUrl} />
            </Worker>
          </div>

          {/* Download Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownload}
            style={{ marginTop: "20px" }}
          >
            Download Report
          </Button>
        </>
      ) : (
        <Typography variant="body1" color="textSecondary">
          Unable to display the report.
        </Typography>
      )}
    </Container>
  );
};

export default FinancialReport;
