import { useState, useEffect } from "react";
import axios from "axios";
import TableRoomAdmin from "../../components/organisms/TableRoomAdmin";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

const ManageRooms = () => {
    const [rows, setRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    const navigate = useNavigate();
    const [openPriceDialogDaily, setOpenPriceDialogDaily] = useState(false);
    const [openPriceDialogMonthly, setOpenPriceDialogMonthly] = useState(false);
    const [priceForm, setPriceForm] = useState("");
    const [priceFormMonthly, setPriceFormMonthly] = useState("");
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_URL}/rooms/update-status`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await axios.put(`${import.meta.env.VITE_API_URL}/rooms/update-booked`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/rooms`, {
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
    useEffect(() => {
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
            <Container maxWidth="xl" sx={{ mt: 10, mb: 10, minHeight: "60vh" }}>
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
                    <Button onClick={() => handleSort("status")} variant="contained"  sx={{ marginRight: 2 }}>
                        Sort by Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Button onClick={() => setOpenPriceDialogDaily(true)} variant="contained"  sx={{ marginRight: 2 }}>
                        Change Daily Room Price
                    </Button>
                    <Button onClick={() => setOpenPriceDialogMonthly(true)} variant="contained">
                        Change Monthly Room Price
                    </Button>
                    <Box sx={{ mt: 3 }}>
                        <TableRoomAdmin rows={sortedRows} />
                    </Box>
                </Paper>
            </Container>
            <Dialog open={openPriceDialogDaily} onClose={() => setOpenPriceDialogDaily(false)}>
                <DialogTitle>Change Daily Room Price</DialogTitle>
                <DialogContent>
                    <TextField
                        label="New Price"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={priceForm}
                        onChange={(e) => setPriceForm(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPriceDialogDaily(false)}>Cancel</Button>
                    <Button variant="contained" onClick={async () => {
                        try {
                            const token = localStorage.getItem("token");
                            await axios.put(`${import.meta.env.VITE_API_URL}/rooms/update-price`, {
                                type: "daily",
                                price: parseFloat(priceForm),
                            }, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                }
                            });
                            setOpenPriceDialogDaily(false);
                            setPriceForm("");
                            fetchData();
                        } catch (err) {
                            console.error("Failed to update price", err);
                        }
                    }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
             <Dialog open={openPriceDialogMonthly} onClose={() => setOpenPriceDialogMonthly(false)}>
                <DialogTitle>Change Monthly Room Price</DialogTitle>
                <DialogContent>
                    <TextField
                        label="New Price"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={priceFormMonthly}
                        onChange={(e) => setPriceFormMonthly(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPriceDialogMonthly(false)}>Cancel</Button>
                    <Button variant="contained" onClick={async () => {
                        try {
                            const token = localStorage.getItem("token");
                            await axios.put(`${import.meta.env.VITE_API_URL}/rooms/update-price`, {
                                type: "monthly",
                                price: parseFloat(priceFormMonthly),
                            }, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                }
                            });
                            setOpenPriceDialogMonthly(false);
                            setPriceFormMonthly("");
                            fetchData();
                        } catch (err) {
                            console.error("Failed to update price", err);
                        }
                    }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Footer />
        </div>
    );
};
export default ManageRooms;