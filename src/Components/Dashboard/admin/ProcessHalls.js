import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../apiClient";
import { useTranslation } from "react-i18next";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import "./ProcessHalls.css";

const ProcessHalls = () => {
  const { t } = useTranslation();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRejecting, setIsRejecting] = useState(false); // Loading state for rejection
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const pageSize = 10;

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
        setTotalPages(data.totalPages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, [page]);

  const handleOpenDialog = (hall) => {
    setSelectedHall(hall);
    setOpenDialog(true);
  };

  const handleOpenRejectDialog = (hall) => {
    setSelectedHall(hall);
    setRejectDialogOpen(true);
  };

  const handleAccept = async () => {
    setOpenDialog(false);

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

      setHalls((prevHalls) =>
        prevHalls.filter((hall) => hall.id !== selectedHall.id)
      );
    } catch (error) {
      setError(error.message);
    }
    window.location.reload();
  };

  const handleReject = async () => {
    setIsRejecting(true); // Show loading overlay
    setRejectDialogOpen(false);

    if (!selectedHall || !rejectionReason.trim()) {
      alert(t("please_provide_reason"));
      setIsRejecting(false); // Hide loading overlay
      return;
    }

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/admin/rejectHall/${selectedHall.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rejectionReason),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reject the hall`);
      }

      const data = await response.json();

      setHalls((prevHalls) =>
        prevHalls.filter((hall) => hall.id !== selectedHall.id)
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRejecting(false); // Hide loading overlay
    }
    window.location.reload();
  };

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
    <div
      className="process-halls-container"
      style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <h1>{t("process_halls")}</h1>

      {halls.length === 0 ? (
        <p>{t("no_halls_to_process")}</p>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("name")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("location")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("capacity")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("description")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("phone")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("proof")}
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: "#cba36b", color: "white" }}
                  >
                    {t("actions")}
                  </TableCell>
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
                        {t("view_proof")}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog(hall)}
                      >
                        {t("accept")}
                      </Button>
                      <Button
                        variant="contained"
                        color="red"
                        onClick={() => handleOpenRejectDialog(hall)}
                        style={{ marginLeft: "10px" }}
                      >
                        {t("reject")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("confirm_accept")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("accept_confirmation", { name: selectedHall?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            {t("cancel")}
          </Button>
          <Button onClick={handleAccept} color="primary">
            {t("accept")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>{t("reject_hall")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("reason")}
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} color="secondary">
            {t("cancel")}
          </Button>
          <Button onClick={handleReject} color="primary">
            {t("reject")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      <Backdrop open={isRejecting} style={{ zIndex: 999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default ProcessHalls;
