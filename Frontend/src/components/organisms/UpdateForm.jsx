import { Button, Container, Box, Link, TextField } from "@mui/material";
import TypographyTemplate from "../molecules/Typography";
import InputLabel from "../molecules/InputLabel";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
const UpdateRoomForm = () => {
    const [pricePerDay, setPricePerDay] = useState("");
    const [pricePerMonth, setPricePerMonth] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/rooms/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const room = response.data;
                setPricePerDay(room.price_per_day || "");
                setPricePerMonth(room.price_per_month || "");
                setStatus(room.status || "");
            } catch (error) {
                toast.error("Failed to load room data");
                console.error(error);
            }
        }
        fetchRoomData();
    }, [id]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pricePerDay == "" && pricePerMonth == "") {
            toast.error("Please One Of Column");
            return;
        }
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/rooms/${id}`, {
                price_per_day: parseFloat(pricePerDay),
                price_per_month: parseFloat(pricePerMonth),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Room update succesfuly");
            navigate("/admin/manage-rooms");
        } catch (error) {
            toast.error("Update failed");
            console.error(error);
        }
    };
    return (
        <Container maxWidth="xs">
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 4,
                    p: 3,
                    boxShadow: 2,
                    borderRadius: 2,
                }}
            >
                <TypographyTemplate variant="h5">Update Room Price</TypographyTemplate>

                <TextField
                    label="Room Status"
                    value={status}
                    InputProps={{ readOnly: true }}
                    fullWidth
                />

                <TextField
                    label="Price Per Day"
                    type="number"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    fullWidth
                />


                <TextField
                    label="Price Per Month"
                    type="number"
                    value={pricePerMonth}
                    onChange={(e) => setPricePerMonth(e.target.value)}
                    fullWidth
                />

                <Button type="submit" variant="contained" color="primary">
                    Update Room
                </Button>
            </Box>
            <div style={{ display:"flex", justifyContent: "center" }}>
                <Link
                    component="button"
                    variant="body1"
                    onClick={() => navigate("/admin/manage-rooms")}
                    sx={{ display: "block", textAlign: "center", mt: 2 }}
                >
                    Back to Rooms
                </Link>
            </div>
        </Container>
    );
};
export default UpdateRoomForm;