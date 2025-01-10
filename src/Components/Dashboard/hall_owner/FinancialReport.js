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
import { useTranslation } from "react-i18next"; // Import useTranslation

const FinancialReport = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFilename, setPdfFilename] = useState(null); // To store the filename
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation(); // Initialize translation hook

  useEffect(() => {
    const fetchFinancialReport = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // Get access token from localStorage
        const ownerId = localStorage.getItem("hallOwnerId"); // Fetch owner ID from localStorage

        if (!ownerId) {
          throw new Error("Owner ID not found");
        }

        // API call to get the PDF filename from the report URL
        const response = await fetch(
          `http://localhost:8080/hallOwner/hallsReservationReport/${ownerId}`,
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
        // if the response is ok and the status is 200, the response body not contains the PDF URL write a message that the hall owner has no financial report
        if (response.status === 200) {
          setError("The hall owner has no financial report");
          return;
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

      // Use regex to extract the filename starting from "HallReport_" and ending with ".pdf"
      const cleanedFilename = pdfFilename.match(/HallReport_.*\.pdf/)[0]; // Extracts the correct filename

      // Construct the API URL using the cleaned filename
      const downloadUrl = `http://localhost:8080/hallOwner/download/${cleanedFilename}`;

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

      // Create a Blob from the response and trigger the download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", cleanedFilename); // Set the correct file name for the download
      document.body.appendChild(link);
      link.click();
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
          {t("loading_report")}
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
        {t("financial_report")}
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
            {t("download_report")}
          </Button>
        </>
      ) : (
        <Typography variant="body1" color="textSecondary">
          {t("unable_to_display_report")}
        </Typography>
      )}
    </Container>
  );
};

export default FinancialReport;
