import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import TableBookingAdmin from "../../components/organisms/TableBookingAdmin";
const ManageBookings = () => {
    const [rows, setRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8080/bookings", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const formattedRows = response.data.map((booking) => ({
                    id: booking.id,
                    room_number: booking.room_number,
                    email: booking.email,
                    start_date: booking.start_date.substring(0, 10),
                    end_date: booking.end_date.substring(0, 10),
                    created_at: booking.created_at.substring(0, 10),
                    status: booking.status,
                    actions: getDynamicActions(booking),
                }));
                setRows(formattedRows);
                console.log("Formatted Rows: ", formattedRows);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);
    const getDynamicActions = (booking) => {
        console.log("Checking actions for booking:", booking);
        let actions = [];
        const status = booking.status.trim();
        if (status === "confirmed") {
            actions.push({ label: "Delete", color: "error", onClick: () => handleDelete(booking.id) });
        }
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
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/bookings/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
            toast.success("Delete success");
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div>
            <Navbar />
            <Container maxWidth="xl" sx={{ mt: 10, mb: 10, minHeight: "60vh" }}>
                <Paper sx={{ p: 3, boxShadow: 3 }}>
                    <Typography
                        variant="h2"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                    >
                        Booking List
                    </Typography>
                    <Button onClick={() => handleSort("id")} variant="contained" sx={{ marginRight: 2 }}>
                        Sort by ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Button onClick={() => handleSort("status")} variant="contained">
                        Sort by Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Box sx={{ mt: 3 }}>
                        <TableBookingAdmin rows={sortedRows} />
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </div>
    );
};
export default ManageBookings;