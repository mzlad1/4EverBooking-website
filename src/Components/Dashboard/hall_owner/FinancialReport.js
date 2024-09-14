import React, { useEffect, useState } from 'react';
import { useAuth } from "../../../Context/AuthContext"; // Assuming you need the token from AuthContext
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css'; // Import react-pdf styles
import './financial.css';

const FinancialReport = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchFinancialReport = async () => {
      try {
        const token = localStorage.getItem('accessToken'); // Get access token from localStorage
        const ownerId = localStorage.getItem('hallOwnerId'); // Fetch owner ID from localStorage

        if (!ownerId) {
          throw new Error('Owner ID not found');
        }

        const response = await fetch(
          `http://localhost:8080/hallOwner/hallsReservationReport/${ownerId}`, // Use dynamic owner ID
          {
            method: 'GET',
            headers: {
              Accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch financial report');
        }

        const pdfUrl = await response.text(); // Response body will be the PDF URL
        setPdfUrl(pdfUrl);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialReport();
  }, [isLoggedIn]);

  if (loading) {
    return <div>Loading Financial Report...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="financial-report-container">
      <h1>Financial Report</h1>
      {pdfUrl ? (
        <>
          {/* Render the PDF using react-pdf-viewer */}
          <div className="pdf-viewer">
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
              <Viewer fileUrl={pdfUrl} />
            </Worker>
          </div>

          {/* Download Button */}
          <div className="download-button-container">
            <a href={pdfUrl} download className="download-btn">
              Download Report
            </a>
          </div>
        </>
      ) : (
        <p>Unable to display the report.</p>
      )}
    </div>
  );
};

export default FinancialReport;
