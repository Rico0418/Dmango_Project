import { useState, useEffect } from "react";
import axios from "axios";
import TableRoomAdmin from "../../components/organisms/TableRoomAdmin";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
const ManageRooms = () => {
    const [rows, setRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
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
    const sortedRows = [...rows].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });
    const handleSort = (key) => {
        setSortConfig((prevSort) => ({
            key,
            direction: prevSort.key === key && prevSort.direction === "asc" ? "desc" : "asc",
        }));
    }
    const handleEdit = (room) => {
        navigate(`/admin/manage-rooms/update/${room.id}`);
    };
    return (
        <div>
            <Navbar />
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3, boxShadow: 3 }}>
                    <Typography
                        variant="h2"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                    >
                        Room List
                    </Typography>
                    <Button onClick={() => handleSort("id")} variant="contained" sx={{ marginRight: 2 }}>
                        Sort by ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Button onClick={() => handleSort("status")} variant="contained">
                        Sort by Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Box sx={{ mt: 3 }}>
                        <TableRoomAdmin rows={sortedRows} />
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </div>
    );
};
export default ManageRooms;