import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <CircularProgress color="primary" size={60} thickness={5} />
      <Typography variant="h6" mt={2} color="textSecondary">
        Loading, please wait...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
