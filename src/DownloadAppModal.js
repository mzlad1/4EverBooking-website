import React from "react";
import { Modal, Box, Typography, Button, Stack } from "@mui/material";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import QRCode from "react-qr-code"; // Optional: Install QR code generator (npm install react-qr-code)

const DownloadAppModal = () => {
  return (
    <Modal
      open={true} // Modal is always open on mobile
      onClose={() => {}} // Prevent closing the modal
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "400px" }, // Responsive width for different screen sizes
          bgcolor: "#ffffff", // White background for a clean look
          borderRadius: "16px", // Rounded corners
          boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
          p: { xs: 2, sm: 4 }, // Responsive padding for different screen sizes
          textAlign: "center",
        }}
      >
        {/* Heading */}
        <Typography
          id="modal-title"
          variant="h5"
          component="h2"
          sx={{
            fontWeight: "bold",
            fontFamily: "'Poppins', sans-serif", // Clean, modern font
            color: "#333",
            mb: 2,
            fontSize: { xs: "18px", sm: "20px", md: "24px" }, // Responsive font sizes
          }}
        >
          Download Our App
        </Typography>

        {/* Subtitle */}
        <Typography
          id="modal-description"
          sx={{
            fontSize: { xs: "14px", sm: "16px" }, // Responsive font sizes
            color: "#555", // Soft color for text
            mb: 4,
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          To get the best experience, please download our mobile app.
        </Typography>

        {/* Buttons for download links */}
        <Stack
          direction="column"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          {/* Android Download Button */}
          <Button
            variant="contained"
            startIcon={<AndroidIcon />} // Android icon
            sx={{
              backgroundColor: "#3DDC84", // Android green color
              color: "#fff",
              width: { xs: "100%", sm: "80%" }, // Responsive width for buttons
              padding: "10px",
              fontSize: "16px",
              fontWeight: "600",
              "&:hover": {
                backgroundColor: "#35c377", // Darker green on hover
              },
            }}
            href="https://play.google.com/store" // Link to Google Play
          >
            Download for Android
          </Button>

          {/* iOS Download Button */}
          <Button
            variant="contained"
            startIcon={<AppleIcon />} // Apple icon
            sx={{
              backgroundColor: "#000", // Sleek black for iOS
              color: "#fff",
              width: { xs: "100%", sm: "80%" }, // Responsive width for buttons
              padding: "10px",
              fontSize: "16px",
              fontWeight: "600",
              "&:hover": {
                backgroundColor: "#333", // Darker black on hover
              },
            }}
            href="https://www.apple.com/app-store/" // Link to App Store
          >
            Download for iOS
          </Button>

          {/* Optional: QR code for direct app download */}
          <Box sx={{ mt: 4 }}>
            <Typography
              sx={{
                fontSize: "14px",
                color: "#777",
                mb: 1,
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              Or scan the QR code to download:
            </Typography>
            <QRCode
              value="https://play.google.com/store" // QR code pointing to app download link
              size={100}
              fgColor="#333" // Dark QR code color
              bgColor="#ffffff" // White background for the QR code
            />
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default DownloadAppModal;
