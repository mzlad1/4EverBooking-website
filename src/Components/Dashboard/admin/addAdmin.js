import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // Translation hook
import { fetchWithAuth } from "../../../apiClient";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import "./AddAdmin.css";

const AddAdmin = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/admin/addAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("admin_creation_failed"));
      }

      const data = await response.json();
      setSuccess(t("admin_created_successfully"));
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        password: "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>{t("add_admin")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setOpenDialog(true);
        }}
      >
        <TextField
          label={t("first_name")}
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("last_name")}
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("email")}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("phone")}
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("date_of_birth")}
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label={t("address")}
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t("password")}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />

        {error && (
          <Alert severity="error">
            {t("error")}: {error}
          </Alert>
        )}
        {success && <Alert severity="success">{success}</Alert>}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          style={{ marginTop: "20px", backgroundColor: "#cba36b" }}
        >
          {loading ? t("loading") : t("add_admin")}
        </Button>
      </form>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">{t("confirmation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {t("confirm_add_admin")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            {t("cancel")}
          </Button>
          <Button
            onClick={() => {
              setOpenDialog(false);
              handleSubmit();
            }}
            color="primary"
            autoFocus
          >
            {t("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddAdmin;
