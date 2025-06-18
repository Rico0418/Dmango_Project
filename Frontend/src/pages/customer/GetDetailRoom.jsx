import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Card, CardContent, CardMedia, Container, MobileStepper, Paper } from "@mui/material";
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
                const token = sessionStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/rooms/${id}`, {
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
            <Container maxWidth="md" sx={{ mt: 8, mb: 8, minHeight: "70vh" }}>
                {room && (
                    <Card sx={{ boxShadow: 4, borderRadius: 2, overflow: "hidden" }}>
                        <CardMedia
                            component="img"
                            image={images[activeStep]}
                            alt={`Room Image ${activeStep + 1}`}
                            sx={{
                                maxHeight: 400,
                                objectFit: "contain",
                                width: "100%",
                                padding: 2,
                                backgroundColor: "#f5f5f5",
                            }}
                        />
                        <MobileStepper
                            variant="dots"
                            steps={maxSteps}
                            position="static"
                            activeStep={activeStep}
                            sx={{
                                backgroundColor: "#f5f5f5",
                                justifyContent: "space-between",
                                px: 2,
                                py: 1,
                            }}
                            nextButton={
                                <Button
                                    size="small"
                                    onClick={handleNext}
                                    disabled={activeStep === maxSteps - 1}
                                    sx={{ color: "#1976d2", "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}
                                >
                                    <KeyboardArrowRight />
                                </Button>
                            }
                            backButton={
                                <Button
                                    size="small"
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                    sx={{ color: "#1976d2","&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}
                                >
                                    <KeyboardArrowLeft />
                                </Button>
                            }
                        />
                        <CardContent sx={{ p: 4, textAlign: "center" }}>
                            <TypographyTemplate variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                                Detail Room - {room.room_number.trim()}
                            </TypographyTemplate>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    alignItems: "center",
                                    maxWidth: 400,
                                    mx: "auto",
                                }}
                            >
                                <TypographyTemplate variant="body1" sx={{ fontWeight: 500 }}>
                                    <strong>Room Number:</strong> {room.room_number}
                                </TypographyTemplate>
                                <TypographyTemplate variant="body1" sx={{ fontWeight: 500 }}>
                                    <strong>Room Type:</strong> {room.type}
                                </TypographyTemplate>
                                {room.type.trim() === "daily" && (
                                    <TypographyTemplate variant="body1" sx={{ fontWeight: 500 }}>
                                        <strong>Price Per Day:</strong> Rp {room.price_per_day?.toLocaleString() || "N/A"}
                                    </TypographyTemplate>
                                )}
                                {room.type.trim() === "monthly" && (
                                    <TypographyTemplate variant="body1" sx={{ fontWeight: 500 }}>
                                        <strong>Price Per Month:</strong> Rp {room.price_per_month?.toLocaleString() || "N/A"}
                                    </TypographyTemplate>
                                )}
                                <TypographyTemplate variant="body1" sx={{ fontWeight: 500 }}>
                                    <strong>Facilities:</strong>{" "}
                                    {room.facilities && room.facilities.length > 0
                                        ? room.facilities.join(", ")
                                        : "None"}
                                </TypographyTemplate>
                            </Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setDialogOpen(true)}
                                sx={{
                                    mt: 4,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    borderRadius: 8,
                                    textTransform: "none",
                                    "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" }
                                }}
                            >
                                Book Room
                            </Button>
                        </CardContent>
                    </Card>
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