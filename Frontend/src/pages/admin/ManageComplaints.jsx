import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TableComplaintAdmin from "../../components/organisms/TableComplaintAdmin";
import { toast } from "react-toastify";
const ManageComplaints = () => {
    const [rows, setRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/complaints`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const formattedRows = response.data.map((complaint) => ({
                    id: complaint.id,
                    guest_house_name: complaint.guest_house_name.trim(),
                    room_number: complaint.room_number,
                    email: complaint.email,
                    description: complaint.description,
                    created_at: complaint.created_at.substring(0, 10),
                    status: complaint.status,
                    actions: getDynamicActions(complaint),
                }));
                setRows(formattedRows);
                console.log("Formatted Rows: ", formattedRows);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);
    const getDynamicActions = (complaint) => {
        let actions = [];
        const status = complaint.status.toLowerCase();
        if(status === "pending"){
            actions.push({ label: "Update", color: "primary", onClick: () => handleEdit(complaint) });
        }else if(status === "resolved"){
            actions.push({ label: "Delete", color: "error", onClick: () => handleDelete(complaint.id) });
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
    const handleEdit = async(complaint) => {
        try{
            const token = sessionStorage.getItem("token");
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/complaints/status/${complaint.id}`,
                { status: "Resolved" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setRows((prevRows) =>
                prevRows.map((row) =>
                    row.id === complaint.id ? { ...row, status: "Resolved", actions: getDynamicActions({ ...row, status: "Resolved" }) } : row
                )
            );
            toast.success("Update complaint status success");
        }catch(error){
            console.error("Error updating complaint status:",error);
        }
    };
    const handleDelete = async(id) =>{
        try{
            const token = sessionStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/complaints/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
            toast.success("Delete success");
        }catch(error){
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
                        Complaint List
                    </Typography>
                    <Button onClick={() => handleSort("id")} variant="contained" sx={{ marginRight: 2 }}>
                        Sort by ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Button onClick={() => handleSort("status")} variant="contained">
                        Sort by Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Box sx={{ mt: 3 }}>
                        <TableComplaintAdmin rows={sortedRows} />
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </div>
    );
};
export default ManageComplaints;