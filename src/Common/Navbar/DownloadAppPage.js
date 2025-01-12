import React from "react";
import { Box, Typography, Button, Stack, Grid } from "@mui/material";
import { useTranslation } from "react-i18next"; // Import translation hook
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import QRCode from "react-qr-code"; // Optional: Install react-qr-code

const DownloadAppPage = () => {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "80vh",
        background: "linear-gradient(135deg, #cba36b, #9b7a52)", // Custom gradient using primary color
        p: 4,
      }}
    >
      <Grid container spacing={4} alignItems="center" justifyContent="center">
        {/* Left Column: Download Information */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              color: "#fff", // White text for better contrast
              mb: 3,
            }}
          >
            {t("download_app_title")}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: "18px",
              color: "#f0e2d1", // Light version of primary color for softer contrast
              mb: 5,
              marginLeft: "60px",
              maxWidth: "600px", // Limit text width for readability
              lineHeight: "1.6",
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {t("download_app_description")}
          </Typography>

          {/* Buttons for Android and iOS */}
          <Stack
            direction="column"
            spacing={3}
            alignItems="center"
            justifyContent="center"
          >
            <Button
              variant="contained"
              startIcon={<AndroidIcon />}
              sx={{
                backgroundColor: "#3DDC84", // Android green color
                color: "#fff",
                width: "250px",
                padding: "10px",
                fontSize: "16px",
                fontWeight: "600",
                "&:hover": {
                  backgroundColor: "#35c377", // Darker green on hover
                },
              }}
              href="https://play.google.com/store" // Link to Google Play
              target="_blank" // Open in a new tab
            >
              {t("download_android")}
            </Button>

            <Button
              variant="contained"
              startIcon={<AppleIcon />}
              sx={{
                backgroundColor: "#000", // Sleek black for iOS
                color: "#fff",
                width: "250px",
                padding: "10px",
                fontSize: "16px",
                fontWeight: "600",
                "&:hover": {
                  backgroundColor: "#333", // Darker black on hover
                },
              }}
              href="https://www.apple.com/app-store/" // Link to App Store
              target="_blank" // Open in a new tab
            >
              {t("download_ios")}
            </Button>

            {/* Optional: QR code for direct download */}
            <Box sx={{ mt: 5, textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: "16px",
                  color: "#e0e0e0",
                  mb: 2,
                }}
              >
                {t("qr_code_instruction")}
              </Typography>
              <QRCode
                value="https://play.google.com/store" // URL for app download
                size={120}
                fgColor="#333"
                bgColor="#ffffff"
              />
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: Phone Image */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src="https://res.cloudinary.com/dykzph9bu/image/upload/v1736696854/psd_phone_template_with_blank_frame_for_design_pra7lg.png"
              alt={t("app_display_image_alt")}
              style={{
                maxWidth: "100%",
                height: "auto", // Ensures the image scales properly
                borderRadius: "20px", // Optional: Adds rounded corners to the image
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", // Soft shadow for a modern look
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DownloadAppPage;
