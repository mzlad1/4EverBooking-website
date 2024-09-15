import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../apiClient";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import './ProcessHalls.css'; // Assuming you have custom styles here

const ProcessHalls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [totalPages, setTotalPages] = useState(1); // Total pages state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null); // Track selected hall for the dialog
  const pageSize = 10; // Page size (can be adjusted)

  // Fetch the halls data based on the current page
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(
          `http://localhost:8080/admin/getAllHallIsProcessed?page=${page}&size=${pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch halls");
        }

        const data = await response.json();
        setHalls(data.content);
        setTotalPages(data.totalPages); // Set total number of pages from the response
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, [page]);

  // Open the dialog and set the selected hall
  const handleOpenDialog = (hall) => {
    setSelectedHall(hall);
    setOpenDialog(true);
  };

  // Handle the accept action
  const handleAccept = async () => {
    setOpenDialog(false); // Close the dialog

    if (!selectedHall) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/admin/processHall/${selectedHall.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to accept the hall`);
      }

      // Optionally update the UI to reflect the action (e.g., remove the hall from the list)
      setHalls((prevHalls) => prevHalls.filter((hall) => hall.id !== selectedHall.id));
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle page change in pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return <p>Loading halls...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="process-halls-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Process Halls</h1>

      {halls.length === 0 ? (
        <p>No halls to process</p>
      ) : (
        <>
          {/* Halls Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Location</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Capacity</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Description</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Phone</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Proof</TableCell>
                  <TableCell sx={{ backgroundColor: '#cba36b', color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {halls.map((hall) => (
                  <TableRow key={hall.id}>
                    <TableCell>{hall.name}</TableCell>
                    <TableCell>{hall.location}</TableCell>
                    <TableCell>{hall.capacity}</TableCell>
                    <TableCell>{hall.description}</TableCell>
                    <TableCell>{hall.phone}</TableCell>
                    <TableCell>
                      <a
                        href={hall.proofFile}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Proof
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog(hall)}
                      >
                        Accept
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}

      {/* Custom Dialog for Accept Confirmation */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Accept</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to accept the hall "{selectedHall?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAccept} color="primary">
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProcessHalls;
