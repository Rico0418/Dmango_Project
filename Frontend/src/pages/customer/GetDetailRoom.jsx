import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Container, MobileStepper, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import roomImage from "../../assets/room.png";
import toilet from "../../assets/toilet.jpg"
import TypographyTemplate from "../../components/molecules/Typography";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import BookingPopup from "../../components/organisms/BookingPopup";


const GetDetailRoom = () => {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const images = [roomImage, toilet];
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();

    //modal state
    const [dialogOpen, setDialogOpen] = useState(false);
    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8080/rooms/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = response.data;

                setRoom(data);
            } catch (error) {
                console.error("Failed to fetch room details:", room)
            }
        };
        fetchRoomDetail();
    }, [id]);
    const maxSteps = images.length;
    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);
    return (
        <div>
            <Navbar />
            <Container maxWidth="xl" sx={{ mt: 10, mb: 10, minHeight: "60vh" }}>
                {room && (
                    <Paper sx={{ p: 4, boxShadow: 3 }}>
                        <TypographyTemplate variant="h4" gutterBottom>
                            Detail Room - {room.room_number.trim()}
                        </TypographyTemplate>
                        <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
                            <Box
                                component="img"
                                src={images[activeStep]}
                                alt={`Slide ${activeStep + 1}`}
                                sx={{
                                    width: "100%",
                                    maxWidth: 350,
                                    height: "auto",
                                    borderRadius: 2,
                                    boxShadow: 3,
                                }}
                            />
                            <MobileStepper
                                variant="dots"
                                steps={maxSteps}
                                position="static"
                                activeStep={activeStep}
                                sx={{ mt: 2, width: "100%", maxWidth: 500 }}
                                nextButton={
                                    <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                                        Next
                                        <KeyboardArrowRight />
                                    </Button>
                                }
                                backButton={
                                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                                        <KeyboardArrowLeft />
                                        Back
                                    </Button>
                                }
                            />
                        </Box>
                        <Box mt={4}>
                            <TypographyTemplate variant="body1">
                                <strong>Status:</strong> {room.status}
                            </TypographyTemplate>
                            <TypographyTemplate variant="body1">
                                <strong>Room Number:</strong> {room.room_number}
                            </TypographyTemplate>
                            <TypographyTemplate variant="body1">
                                <strong>Room Type:</strong> {room.type}
                            </TypographyTemplate>
                            {room.type.trim() === "daily" && (
                                <TypographyTemplate variant="body1">
                                    <strong>Price Per Day:</strong> Rp {room.price_per_day.toLocaleString()}
                                </TypographyTemplate>
                            )}

                            {room.type.trim() === "monthly" && (
                                <TypographyTemplate variant="body1">
                                    <strong>Price Per Month:</strong> Rp {room.price_per_month.toLocaleString()}
                                </TypographyTemplate>
                            )}
                        </Box>
                        <Box mt={4}>
                            <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
                                Book Room
                            </Button>
                        </Box>
                    </Paper>
                )}
                <BookingPopup
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    room={room}
                />
            </Container>
            <Footer />
        </div>
    );
};
export default GetDetailRoom;