import { useState, useEffect } from "react";
import axios from "axios";
import TableRoomAdmin from "../../components/organisms/TableRoomAdmin";
import TypographyTemplate from "../../components/molecules/Typography";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Container, Paper } from "@mui/material";
const ManageRooms = () => {
    const [rows, setRows] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8080/rooms", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const formattedRows = response.data.map((room) => ({
                    id: room.id,
                    guest_house_id: room.guest_house_id,
                    room_number: room.room_number,
                    type: room.type,                                             
                    price_per_day: room.price_per_day,
                    price_per_month: room.price_per_month,
                    status: room.status,
                    actions: getDynamicActions(room),
                }));
                setRows(formattedRows);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);
    const getDynamicActions = (room) => {
        let actions = [];
        actions.push({ label: "Edit", color: "primary", onClick: () => handleEdit(room) });

        return actions;
    };
    const handleEdit = (room) => {
        console.log("Editing room:", room);
    };
    return (
        <div>
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3, boxShadow: 3 }}>
                    <TypographyTemplate
                        variant="h2"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                    >
                        Room List
                    </TypographyTemplate>
                    <Box sx={{ mt: 3 }}>
                        <TableRoomAdmin rows={rows} />
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </div>
    );
};
export default ManageRooms;