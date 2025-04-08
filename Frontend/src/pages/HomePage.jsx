import { Box, Button, Container, IconButton, Typography } from "@mui/material";
import Footer from "../components/organisms/Footer";
import Navbar from "../components/organisms/Navbar";
import building from "../assets/building.jpg";
import exterior from "../assets/exterior.jpg";
import stair from "../assets/stair.jpg";
import facility from "../assets/facility_1.jpg";
import { useState } from "react";

const images = [building,exterior,stair,facility];
const HomePage = () => {
    const [currentImage, setCurrentImage] = useState(0);
    const handleNext = () => {
        setCurrentImage((prev)=>(prev+1) % images.length);
    };
    const handlePrev = () => {
        setCurrentImage((prev)=>(prev-1 + images.length) % images.length);
    };
    return (
        <div>
            <Navbar />
            <main style={{ padding: '30px' }}>
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
                            Welcome to Dmango Residence
                        </Typography>

                        <Typography variant="body1" sx={{ maxWidth: "600px", marginBottom: "20px" }}>
                            Dmango Residence is a premium accommodation service offering comfortable,
                            affordable, and modern living spaces. Whether you're looking for short-term
                            stays or long-term rentals, we provide a seamless booking experience.
                        </Typography>

                        <Box
                         sx={{
                            position: "relative",
                            width: "100%",
                            maxWidth: "500px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                           <Button
                                onClick={handlePrev}
                                variant="contained"
                                sx={{ position: "absolute", left: -65, outline: "none",
                                    boxShadow: "none",
                                    "&:focus": {
                                      outline: "none",
                                      boxShadow: "none",
                                    },
                                    "&:active": {
                                      outline: "none",
                                      boxShadow: "none",
                                    }, }}
                            >
                                {"◀"}
                            </Button>

                            <Box
                                component="img"
                                src={images[currentImage]}
                                alt="Dmango Residence"
                                sx={{ width: "100%", borderRadius: "10px", boxShadow: 2 }}
                            />

                            <Button
                                onClick={handleNext}
                                variant="contained"
                                sx={{ position: "absolute", right: -65,outline: "none",
                                    boxShadow: "none",
                                    "&:focus": {
                                      outline: "none",
                                      boxShadow: "none",
                                    },
                                    "&:active": {
                                      outline: "none",
                                      boxShadow: "none",
                                    }, }}
                            >
                                 {"▶"}
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </main>
            <Footer />
        </div>
    );
};
export default HomePage;