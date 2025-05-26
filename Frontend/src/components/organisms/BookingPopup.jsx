import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Tooltip,
  Typography,
} from "@mui/material";
import { StaticDatePicker, LocalizationProvider, PickersDay } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { isBefore, isEqual, startOfDay } from "date-fns";

const BookingPopup = ({ open, onClose, room }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookedRanges, setBookedRanges] = useState([]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/bookings/room/${room.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (Array.isArray(response.data)) {
          const ranges = response.data
            .map((b) => {
              const start = new Date(b.start_date);
              const end = new Date(b.end_date);
              if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.warn("Invalid date in booking:", b);
                return null;
              }
              return [start, end];
            })
            .filter(Boolean);
          setBookedRanges(ranges);
        } else {
          console.error("Response data is not an array:", response.data);
          setBookedRanges([]);
        }
      } catch (err) {
        console.error("Failed to fetch booked dates:", err);
        setBookedRanges([]);
      }
    };
    if (room?.id) {
      fetchBookedDates();
    }
  }, [room]);

  console.log("Booked ranges:", bookedRanges);

  const calculateAmount = () => {
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

  const toLocaleDateString = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isDateBooked = (date) => {
    const normalized = startOfDay(date);
    const isBooked = bookedRanges.some(([start, end]) => {
      const result = normalized >= startOfDay(start) && normalized <= startOfDay(end);
      return result;
    });
    return isBooked;
  };

  const shouldDisableDate = (date) => {
    const today = startOfDay(new Date());
    const normalizedDate = startOfDay(new Date());
    return  isBefore(normalizedDate,today) || isDateBooked(date);
  }

  const hasDateRangeOverlap = (start, end) => {
    const normalizedStart = startOfDay(start);
    const normalizedEnd = startOfDay(end);
    return bookedRanges.some(([bookedStart, bookedEnd]) => {
        const normalizedBookedStart = startOfDay(bookedStart);
        const normalizedBookedEnd = startOfDay(bookedEnd);
        return normalizedStart <= normalizedBookedEnd && normalizedEnd >= normalizedBookedStart;
    });
  };

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
      if(room.type.trim() === "monthly"){
        const start = new Date(startDate);
        const end = new Date(endDate);
        const monthDiff = (end.getFullYear() - start.getFullYear())*12
                          + (end.getMonth() - start.getMonth());
        if (monthDiff < 1) {
          toast.error("Minimum booking for monthly rooms is 1 month");
          return;
        }
      }
      if (hasDateRangeOverlap(startDate,endDate)){
        toast.error("Selected date range overlaps with an existing booking");
        return;
      }
      const bookingResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/bookings`,
        {
          room_id: room.id,
          user_id: user.id,
          start_date: toLocaleDateString(startDate),
          end_date: toLocaleDateString(endDate),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
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
      onClose();
      navigate("/customer/rooms");
    } catch (error) {
      toast.error("Error: " + error.message);
      setError("Failed to complete booking");
    }
  };

  const renderDayWithTooltip = ({ day, ...pickersDayProps }) => {
    const isBooked = isDateBooked(day);
    const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
    const dayComponent = (
      <PickersDay
        {...pickersDayProps}
        day={day}
        disabled={isBooked || isPast}
        sx={{
          ...(isBooked && {
            bgcolor: "#ccc",
            color: "#888",
          }),
          ...(isPast && {
            bgcolor: "#f0f0f0",
            color: "#aaa",
          })
        }}
      />
    );

    return isBooked ? (
      <Tooltip title="Already booked" arrow>
        <span style={{ display: "inline-block" }}>{dayComponent}</span>
      </Tooltip>
    ) : isPast ? (
      <Tooltip title="Cannot select past dates" arrow>
        <span style={{ display: "inline-block" }}>{dayComponent}</span>
      </Tooltip>
    ) : (
      dayComponent
    );
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Book Room - {room?.room_number}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Typography>Start Date:</Typography>
          <StaticDatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            shouldDisableDate={shouldDisableDate}
            slots={{ day: renderDayWithTooltip }}
          />
          <Typography>End Date:</Typography>
          <StaticDatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            shouldDisableDate={shouldDisableDate}
            slots={{ day: renderDayWithTooltip }}
          />
        </LocalizationProvider>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleBook} variant="contained" color="primary">
          Confirm Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingPopup;