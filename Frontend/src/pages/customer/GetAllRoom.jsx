import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Container, FormControl, InputLabel, MenuItem, Paper, Select, Tab, Tabs } from "@mui/material";
import TypographyTemplate from "../../components/molecules/Typography";
import { useNavigate } from "react-router-dom";

const GetAllRoom = () => {
    const [rooms, setRooms] = useState([]);
    const [floor, setFloor] = useState(0);
    const [guestHouses, setGuestHouses] = useState([]);
    const [selectedGH, setSelectedGH] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const fetchGuestHouses = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/guest_houses`,{
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGuestHouses(response.data);
                if(response.data.length > 0){
                    setSelectedGH(response.data[0].id);
                }
            }catch (error){
                console.error(error);
            }
        };
        fetchGuestHouses();
    }, [])
    useEffect(() => {
        if(!selectedGH) return;
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                console.log(token);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/rooms?guest_house_id=${selectedGH}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const sortedRooms = response.data.sort((a, b) => a.id - b.id);
                setRooms(sortedRooms);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [selectedGH]);
    console.log(rooms);
    const firstFloorRooms = rooms.filter(room => room.room_number.trim().startsWith("10"));
    const secondFloorRooms = rooms.filter(room => room.room_number.trim().startsWith("20"));
    const renderRooms = (rooms) => (
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={2}>
            {rooms.map((room) => (
                <Paper key={room.id}
                    elevation={3}
                    onClick={() => navigate(`/customer/rooms/${room.id}`)}
                    sx={{
                        width: {xs: "22%", sm: 100},
                        minWidth: 80,
                        height: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        backgroundColor: "#F2C078",
                        cursor: "pointer",
                    }}>
                    <TypographyTemplate variant="body1">{room.room_number.trim()}</TypographyTemplate>
                    <TypographyTemplate variant="caption">{room.type.trim()}</TypographyTemplate>
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
                <FormControl sx={{ minWidth: 200, mt: 2 }}>
                    <InputLabel id="guest-house-select-label">Guest House</InputLabel>
                    <Select
                        labelId="guest-house-select-label"
                        value={selectedGH}
                        label="Guest House"
                        onChange={(e) => setSelectedGH(e.target.value)}
                    >
                        {guestHouses.map((gh) => (
                            <MenuItem key={gh.id} value={gh.id}>
                                {gh.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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