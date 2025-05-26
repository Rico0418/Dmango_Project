import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import TablePaymentAdmin from "../../components/organisms/TablePaymentAdmin";
import { startOfDay } from "date-fns";
const ManagePaymentDetail = () => {
    const [rows, setRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/payments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const formattedRows = response.data.map((payment) => {
                const booking = payment.booking;
                const endDate = booking ? new Date(booking.end_date) : null;
                return {
                    id: payment.id,
                    booking_id: payment.booking_id,
                    amount: payment.amount,
                    method: payment.method,
                    created_at: payment.created_at.substring(0, 10),
                    status: payment.status,
                    endDate,
                    actions: getDynamicActions(payment),
                };
            });

            setRows(formattedRows);
            console.log("Formatted Rows: ", formattedRows);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    const getDynamicActions = (payment) => {
        let actions = [];
        const status = payment.status.trim().toLowerCase();

        const today = startOfDay(new Date());

        if (!payment.booking || !payment.booking.end_date) {
            actions.push({
                label: "Invalid Booking",
                color: "default",
                disabled: true,
                onClick: () => toast.warning("No booking data available for this payment."),
            });
            return actions;
        }

        const endDate = startOfDay(new Date(payment.booking.end_date));
        const isEndDatePast = endDate < today;

        if (isEndDatePast) {
            actions.push(
                {
                    label: "Expired",
                    color: "default",
                    disabled: true,
                    onClick: () => toast.info("Cannot modify payment: Booking end date has passed"),
                },
                {
                    label: "Delete",
                    color: "error",
                    onClick: () => handleDelete(payment.id),
                }
            );
        } else {
            if (status === "accepted") {
                actions.push(
                    {
                        label: "Cancel",
                        color: "warning",
                        onClick: () => handleCancel(payment.id),
                    },
                    {
                        label: "Delete",
                        color: "error",
                        onClick: () => handleDelete(payment.id),
                    }
                );
            } else if (status === "pending" || status === "canceled") {
                actions.push(
                    {
                        label: "Accept",
                        color: "success",
                        onClick: () => handleAccept(payment),
                    },
                    {
                        label: "Delete",
                        color: "error",
                        onClick: () => handleDelete(payment.id),
                    }
                );
            }
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
    const handleAccept = async (payment) => {
        try {
            const token = localStorage.getItem("token");
            const bookingResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/bookings/${payment.booking_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const booking = bookingResponse.data;
            if (!booking || booking.status.trim().toLowerCase() === "confirmed") {
                toast.error(
                    `Booking ID ${payment.booking_id} is invalid or already confirmed`
                );
                return;
            }
            const confirmedBookingsResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/bookings/room/${booking.room_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const confirmedBookings = Array.isArray(confirmedBookingsResponse.data)
                ? confirmedBookingsResponse.data.map((b) => ({
                    id: b.id,
                    start_date: new Date(b.start_date),
                    end_date: new Date(b.end_date),
                }))
                : [];
            const normalizedStart = startOfDay(new Date(booking.start_date));
            const normalizedEnd = startOfDay(new Date(booking.end_date));
            const hasOverlap = confirmedBookings.some((b) => {
                const normalizedBookedStart = startOfDay(b.start_date);
                const normalizedBookedEnd = startOfDay(b.end_date);
                return (
                    normalizedStart <= normalizedBookedEnd &&
                    normalizedEnd >= normalizedBookedStart
                );
            });
            if (hasOverlap) {
                toast.error(
                    `Cannot accept payment ID ${payment.id}: Booking overlaps with a confirmed booking`
                );
                return;
            }
            await axios.patch(`${import.meta.env.VITE_API_URL}/payments/${payment.id}`,
                { status: "accepted" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Payment accepted");
            setRows((prev) =>
                prev.map((row) =>
                    row.id === payment.id
                        ? { ...row, status: "accepted", actions: getDynamicActions({ ...row, status: "accepted" }) }
                        : row
                )
            );
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept payment");
        }
    };

    const handleCancel = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${import.meta.env.VITE_API_URL}/payments/${id}`,
                { status: "canceled" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.info("Payment canceled");
            setRows((prev) =>
                prev.map((row) =>
                    row.id === id
                        ? { ...row, status: "canceled", actions: getDynamicActions({ ...row, status: "canceled" }) }
                        : row
                )
            );
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel payment");
        }
    }
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/payments/${id}`, {
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
                        Payment Detail
                    </Typography>
                    <Button onClick={() => handleSort("id")} variant="contained" sx={{ marginRight: 2 }}>
                        Sort by ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Button onClick={() => handleSort("status")} variant="contained">
                        Sort by Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Box sx={{ mt: 3 }}>
                        <TablePaymentAdmin rows={sortedRows} />
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </div>
    );
};
export default ManagePaymentDetail;