import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import TablePaymentAdmin from "../../components/organisms/TablePaymentAdmin";
const ManagePaymentDetail = () => {
    const [rows, setRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8080/payments`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const formattedRows = response.data.map((payment) => ({
                    id: payment.id,
                    booking_id: payment.booking_id,
                    amount: payment.amount,
                    method: payment.method,
                    created_at: payment.created_at.substring(0, 10),
                    status: payment.status,
                    actions: getDynamicActions(payment),
                }));
                setRows(formattedRows);
                console.log("Formatted Rows: ", formattedRows);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);
    const getDynamicActions = (payment) => {
        let actions = [];
        const status = payment.status.trim().toLowerCase();
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
                    onClick: () => handleAccept(payment.id),
                },
                {
                    label: "Delete",
                    color: "error",
                    onClick: () => handleDelete(payment.id),
                }
            );
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
    const handleAccept = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8080/payments/${id}`,
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
                    row.id === id
                        ? { ...row, status: "accepted", actions: getDynamicActions({ ...row, status: "accepted" }) }
                        : row
                )
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept payment");
        }
    };
    const handleCancel = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8080/payments/${id}`,
                { status: "canceled"},
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
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel payment");
        }
    }
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/payments/${id}`, {
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