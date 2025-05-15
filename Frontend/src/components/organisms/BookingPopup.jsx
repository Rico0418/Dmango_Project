import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Alert
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { isBefore, isEqual } from "date-fns";
const BookingPopup = ({ open, onClose, room }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    const calculateAmount = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let duration = 1;
        if (room.type.trim() === "daily") {
            duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return duration * room.price_per_day;
        } else {
            duration = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            duration = duration <= 0 ? 1 : duration;
            return duration * room.price_per_month;
        }
    }
    const toLocaleDateString = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    const handleBook = async () => {
        try {
            console.log("Start Date raw:", startDate);
            console.log("End Date raw:", endDate);
            const token = localStorage.getItem("token");
            if (!startDate || !endDate) {
                toast.error("Please select both start and end date");
                return;
            }
            const isValidDateRange = isBefore(startDate, endDate);
            if (!isValidDateRange || isEqual(startDate, endDate)) {
                toast.error("Start date must be before end date");
                return;
            }
            const bookingResponse = await axios.post("http://localhost:8080/bookings", {
                room_id: room.id,
                user_id: user.id,
                start_date: toLocaleDateString(startDate),
                end_date: toLocaleDateString(endDate),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await axios.post("http://localhost:8080/payments", {
                booking_id: bookingResponse.data.booking_id,
                amount: calculateAmount()
            }, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            toast.success("Booking and payment created succesfully");
            onClose();
            navigate("/customer/rooms");
        } catch (error) {
            toast.error("Error: ", error);
            setError("Faied to complete booking");
        }
    };
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Book Room - {room?.room_number}</DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => <TextField fullWidth margin="normal" {...params} />}
                    />
                    <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        renderInput={(params) => <TextField fullWidth margin="normal" {...params} />}
                    />
                </LocalizationProvider>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button onClick={handleBook} variant="contained" color="primary">Confirm Booking</Button>
            </DialogActions>
        </Dialog>
    )
}
export default BookingPopup;