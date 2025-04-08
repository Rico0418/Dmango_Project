import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Container, Paper, Tab, Tabs } from "@mui/material";
import TypographyTemplate from "../../components/molecules/Typography";
import { useNavigate } from "react-router-dom";

const GetAllRoom = () => {
    const [rooms, setRooms] = useState([]);
    const [floor, setFloor] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8080/rooms", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRooms(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);
    console.log(rooms);
    const firstFloorRooms = rooms.filter(room => room.room_number.trim().startsWith("10"));
    const secondFloorRooms = rooms.filter(room => room.room_number.trim().startsWith("20"));
    const renderRooms = (rooms) => (
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
            {rooms.map((room) => (
                <Paper key={room.id}
                    elevation={3}
                    onClick={() => {
                        if (room.status.trim() !== "booked") {
                          navigate(`/customer/rooms/${room.id}`);
                        }
                      }}
                    sx={{
                        width: 100,
                        height: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        backgroundColor: room.status.trim() === "booked" ? "#e57373" : "#81c784",
                        cursor: room.status.trim() === "booked" ? "not-allowed" : "pointer",
                        pointerEvents: room.status.trim() === "booked" ? "none" : "auto",
                    }}>
                    <TypographyTemplate variant="body1">{room.room_number.trim()}</TypographyTemplate>
                    <TypographyTemplate variant="caption">{room.status.trim()}</TypographyTemplate>
                </Paper>
            ))}
        </Box>
    );
    return (
        <div>
            <Navbar />
            <Container maxWidth="xl" sx={{ mt: 10, mb: 10, minHeight: "60vh" }}>
                <TypographyTemplate variant="h4" gutterBottom>
                    Available Room List
                </TypographyTemplate>
                <Box display="flex" justifyContent="center" mt={2}>
                    <Tabs value={floor} onChange={(e, newValue) => setFloor(newValue)}>
                        <Tab label="1st Floor" sx={{ "&:focus": { outline: "none" } }} />
                        <Tab label="2nd Floor" sx={{ "&:focus": { outline: "none" } }} />
                    </Tabs>
                </Box>

                {floor === 0 && renderRooms(firstFloorRooms)}
                {floor === 1 && renderRooms(secondFloorRooms)}
            </Container>
            <Footer />
        </div>
    );
};
export default GetAllRoom;