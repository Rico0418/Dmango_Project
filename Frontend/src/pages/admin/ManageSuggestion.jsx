import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/organisms/Navbar";
import Footer from "../../components/organisms/Footer";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TableComplaintAdmin from "../../components/organisms/TableComplaintAdmin";
import { toast } from "react-toastify";
import TableSuggestionAdmin from "../../components/organisms/TableSuggestionAdmin";
const ManageComplaints = () => {
    const [rows, setRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/suggestion`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const formattedRows = response.data.map((suggestion) => ({
                    id: suggestion.id,
                    description: suggestion.description,
                    created_at: suggestion.created_at.substring(0, 10),
                    actions: getDynamicActions(suggestion),
                }));
                setRows(formattedRows);
                console.log("Formatted Rows: ", formattedRows);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);
    const getDynamicActions = (suggestion) => {
        let actions = [];
        actions.push({ label: "Delete", color: "error", onClick: () => handleDelete(suggestion.id) });
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
    const handleDelete = async(id) =>{
        try{
            const token = sessionStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/suggestion/${id}`, {
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
                        Suggestion List
                    </Typography>
                    <Button onClick={() => handleSort("id")} variant="contained" sx={{ marginRight: 2,"&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}>
                        Sort by ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </Button>
                    <Box sx={{ mt: 3 }}>
                        <TableSuggestionAdmin rows={sortedRows} />
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </div>
    );
};
export default ManageComplaints;