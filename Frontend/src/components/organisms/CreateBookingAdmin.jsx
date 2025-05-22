
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Tooltip,
    Typography,
} from "@mui/material";
import { LocalizationProvider, StaticDatePicker, PickersDay } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { startOfDay, isBefore, isEqual } from "date-fns";

const CreateBookingAdmin = ({ open, onClose, onBookingCreated }) => {
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [userId, setUserId] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [error, setError] = useState("");
    const [bookedRanges, setBookedRanges] = useState([]);

    useEffect(() => {
        const fetchRoomsAndUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const [roomsResponse, userResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/rooms`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setRooms(Array.isArray(roomsResponse.data) ? roomsResponse.data : []);
                setUsers(Array.isArray(userResponse.data) ? userResponse.data : []);
            } catch (err) {
                console.error("Failed to fetch rooms or user: ", err);
                toast.error("Failed to load rooms or users");
            }
        };
        fetchRoomsAndUsers();
    }, []);

    useEffect(() => {
        if (!roomId) return;
        const fetchBookedDates = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/room/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const ranges = Array.isArray(response.data)
                    ? response.data
                        .map((b) => {
                            const start = new Date(b.start_date);
                            const end = new Date(b.end_date);
                            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                                console.warn("Invalid date in booking:", b);
                                return null;
                            }
                            return [start, end];
                        })
                        .filter(Boolean)
                    : [];
                setBookedRanges(ranges);
            } catch (err) {
                console.error("Failed to fetch booked dates:", err);
                setBookedRanges([]);
            }
        };
        fetchBookedDates();
    }, [roomId]);

    const toLocaleDateString = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const isDateBooked = (date) => {
        const normalized = startOfDay(date);
        return bookedRanges.some(([start, end]) => {
            return normalized >= startOfDay(start) && normalized <= startOfDay(end);
        });
    };

    const shouldDisableDate = (date) => {
        return isDateBooked(date);
    };

    const hasDateRangeOverlap = (start, end) => {
        const normalizedStart = startOfDay(start);
        const normalizedEnd = startOfDay(end);
        return bookedRanges.some(([bookedStart, bookedEnd]) => {
            const normalizedBookedStart = startOfDay(bookedStart);
            const normalizedBookedEnd = startOfDay(bookedEnd);
            return normalizedStart <= normalizedBookedEnd && normalizedEnd >= normalizedBookedStart;
        });
    };

    const calculateAmount = () => {
        const room = rooms.find((r) => r.id === parseInt(roomId));
        if (!room || !startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        let duration = 1;
        if (room.type.trim() === "daily") {
            duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return duration * room.price_per_day;
        } else {
            duration =
                (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth());
            duration = duration <= 0 ? 1 : duration;
            return duration * room.price_per_month;
        }
    };

    const renderDayWithTooltip = ({ day, ...pickersDayProps }) => {
        const isBooked = isDateBooked(day);
        const dayComponent = (
            <PickersDay
                {...pickersDayProps}
                day={day}
                disabled={isBooked}
                sx={{
                    ...(isBooked && {
                        bgcolor: "#ccc",
                        color: "#888",
                    }),
                }}
            />
        );

        return isBooked ? (
            <Tooltip title="Already booked" arrow>
                <span style={{ display: "inline-block" }}>{dayComponent}</span>
            </Tooltip>
        ) : (
            dayComponent
        );
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!roomId || !userId || !startDate || !endDate) {
                toast.error("Please fill in all fields");
                return;
            }
            const isValidDateRange = isBefore(startDate, endDate);
            if (!isValidDateRange || isEqual(startDate, endDate)) {
                toast.error("Start date must be before end date");
                return;
            }
            if (hasDateRangeOverlap(startDate, endDate)) {
                toast.error("Selected date range overlaps with a confirmed booking");
                return;
            }
            const bookingResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/bookings`,
                {
                    room_id: parseInt(roomId),
                    user_id: parseInt(userId),
                    start_date: toLocaleDateString(startDate),
                    end_date: toLocaleDateString(endDate),
                },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );
            await axios.post(
                `${import.meta.env.VITE_API_URL}/payments`,
                {
                    booking_id: bookingResponse.data.booking_id,
                    amount: calculateAmount(),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success("Booking and payment created successfully");
            onBookingCreated();
            onClose();
        } catch (err) {
            console.error("Failed to create booking:", err);
            setError("Failed to create booking");
            toast.error("Failed to create booking");
        }
    };
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Room</InputLabel>
                        <Select
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            label="Room"
                        >
                            {rooms.map((room) => (
                                <MenuItem key={room.id} value={room.id}>
                                    {room.room_number}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>User</InputLabel>
                        <Select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            label="User"
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.email}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <StaticDatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        shouldDisableDate={shouldDisableDate}
                        slots={{ day: renderDayWithTooltip }}
                    />
                    <StaticDatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        shouldDisableDate={shouldDisableDate}
                        slots={{ day: renderDayWithTooltip }}
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </LocalizationProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Create Booking
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default CreateBookingAdmin;