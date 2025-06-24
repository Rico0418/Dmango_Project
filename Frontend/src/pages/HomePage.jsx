import { Box, Button, Container, IconButton, Typography, Tabs, Tab } from "@mui/material";
import Footer from "../components/organisms/Footer";
import Navbar from "../components/organisms/Navbar";
import building from "../assets/building.jpg";
import exterior from "../assets/exterior.jpg";
import stair from "../assets/stair.jpg";
import facility from "../assets/facility_1.jpg";
import interior1 from "../assets/Residence1/interior.jpg";
import exterior1 from "../assets/Residence1/exterior.jpg";
import { useState, useEffect } from "react";
import axios from "axios";

const images1 = [interior1, exterior1];
const images2 = [building, exterior, stair, facility];

const HomePage = () => {
  const [currentImage1, setCurrentImage1] = useState(0);
  const [currentImage2, setCurrentImage2] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const handleNext1 = () => {
    setCurrentImage1((prev) => (prev + 1) % images1.length);
  };
  const handlePrev1 = () => {
    setCurrentImage1((prev) => (prev - 1 + images1.length) % images1.length);
  };

  const handleNext2 = () => {
    setCurrentImage2((prev) => (prev + 1) % images2.length);
  };
  const handlePrev2 = () => {
    setCurrentImage2((prev) => (prev - 1 + images2.length) % images2.length);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <Navbar />
      <main style={{ padding: "30px" }}>
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              minHeight: "80vh",
            }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Welcome to D'Mango Residences
            </Typography>

            <Typography variant="body1" sx={{ maxWidth: "600px", marginBottom: "20px" }}>
              D'Mango Residence offers premium accommodation services with comfortable, affordable, and
              modern living spaces. Explore our residences below. Spacious monthly and daily rental room with toilet, television, and AC.
            </Typography>

            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="D'mango Residence 1" sx={{ "&:focus": { outline: "none" } }}/>
              <Tab label="D'mango Residence 2" sx={{ "&:focus": { outline: "none" } }}/>
            </Tabs>

            {activeTab === 0 && (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "500px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Button
                  onClick={handlePrev1}
                  variant="contained"
                  sx={{
                    position: "absolute",
                    left: -65,
                    outline: "none",
                    boxShadow: "none",
                    "&:focus": { outline: "none", boxShadow: "none" },
                    "&:active": { outline: "none", boxShadow: "none" },
                  }}
                >
                  {"◀"}
                </Button>

                <Box
                  component="img"
                  src={images1[currentImage1]}
                  alt="D'mango Residence 1"
                  sx={{ width: "100%", borderRadius: "10px", boxShadow: 2 }}
                />

                <Button
                  onClick={handleNext1}
                  variant="contained"
                  sx={{
                    position: "absolute",
                    right: -65,
                    outline: "none",
                    boxShadow: "none",
                    "&:focus": { outline: "none", boxShadow: "none" },
                    "&:active": { outline: "none", boxShadow: "none" },
                  }}
                >
                  {"▶"}
                </Button>
              </Box>
            )}

            {activeTab === 1 && (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "500px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Button
                  onClick={handlePrev2}
                  variant="contained"
                  sx={{
                    position: "absolute",
                    left: -65,
                    outline: "none",
                    boxShadow: "none",
                    "&:focus": { outline: "none", boxShadow: "none" },
                    "&:active": { outline: "none", boxShadow: "none" },
                  }}
                >
                  {"◀"}
                </Button>

                <Box
                  component="img"
                  src={images2[currentImage2]}
                  alt="D'mango Residence 2"
                  sx={{ width: "100%", borderRadius: "10px", boxShadow: 2,maxHeight: "500px" }}
                />

                <Button
                  onClick={handleNext2}
                  variant="contained"
                  sx={{
                    position: "absolute",
                    right: -65,
                    outline: "none",
                    boxShadow: "none",
                    "&:focus": { outline: "none", boxShadow: "none" },
                    "&:active": { outline: "none", boxShadow: "none" },
                  }}
                >
                  {"▶"}
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </main>
      <Footer />
    </div>
  );
};
export default HomePage;