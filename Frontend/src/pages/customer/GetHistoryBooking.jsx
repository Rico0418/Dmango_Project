import { useEffect, useState } from "react";
import Footer from "../../components/organisms/Footer";
import Navbar from "../../components/organisms/Navbar";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Card, CardContent, Typography, Alert, Box, Button } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Pagination from "@mui/material/Pagination";

const GetHistoryBooking = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(payments.length / itemsPerPage);
    const handleChangePage = (event, value) => {
        setCurrentPage(value);
    }

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setError("Failed to fetch booking history");
            }
        };
        fetchPayments();
    }, [user.id]);
    const handleWhatsAppRedirect = (payment) => {
        const PhoneNumber = import.meta.env.VITE_OWNER_PHONE_NUMBER;
        const message = `Order D'mango Detail:\nBooking ID: ${payment.booking.id}\nName: ${payment.booking.name}\nEmail: ${payment.booking.email}\nRoom Number: ${payment.booking.room_number.trim()}\nStart-date: ${new Date(payment.booking.start_date).toLocaleDateString()}\nEnd-date: ${new Date(payment.booking.end_date).toLocaleDateString()}\nAmount: Rp ${payment.amount.toLocaleString()}\n 
Berikut pesanan saya yang saya sudah buat di web
        `.trim();
        const url = `https://wa.me/${PhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };
    const handleDownloadInvoice = (payment) => {
        const data = [
            {
                "Booking ID": payment.booking.id,
                "Name": payment.booking.name,
                "Email": payment.booking.email,
                "Guest House": payment.guest_house_name.trim(),
                "Room Number": payment.booking.room_number.trim(),
                "Start-date": new Date(payment.booking.start_date).toLocaleDateString(),
                "End-date": new Date(payment.booking.end_date).toLocaleDateString(),
                "Amount (Rp)": payment.amount,
                "Status": payment.status.trim(),
            }
        ];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileName = `Invoice_Booking_${payment.booking.name}.xlsx`;
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, fileName);
    }
    return (
        <div>
            <Navbar />
            <div style={{ padding: "2rem", minHeight: "80vh" }}>
                <Typography variant="h4" gutterBottom>
                    Booking History
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                {payments.length === 0 ? (
                    <Typography>No bookings found.</Typography>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {currentItems.map((payment) => (
                            <Card key={payment.id} sx={{
                                mb: 3, borderRadius: 2,
                                boxShadow: 3, border: "1px solid #e0e0e0",
                                maxWidth: 800, width: "100%"
                            }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        {payment.guest_house_name} - Room #{payment.booking.room_number.trim()}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Start Date:</strong>{" "}
                                        {new Date(payment.booking.start_date).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>End Date:</strong>{" "}
                                        {new Date(payment.booking.end_date).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Amount:</strong> Rp {payment.amount.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Status:</strong>{" "}
                                        {payment.status.trim().charAt(0).toUpperCase() + payment.status.trim().slice(1).toLowerCase()}
                                    </Typography>

                                    {payment.status.trim().toLowerCase() === "pending" && (
                                        <Box>
                                            <Alert severity="warning" sx={{ mb: 2 }}>
                                                Please contact the owner to complete your transaction.
                                            </Alert>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => handleWhatsAppRedirect(payment)}
                                                sx={{ textTransform: "none","&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}
                                            >
                                                Contact via WhatsApp
                                            </Button>
                                        </Box>
                                    )}
                                    {payment.status.trim().toLowerCase() === "accepted" && (
                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleDownloadInvoice(payment)}
                                                sx={{ textTransform: "none","&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}
                                            >
                                                Download Invoice
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {payments.length > itemsPerPage && (
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handleChangePage}
                                color="primary"
                                sx={{ mt: 2 }}
                            />
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
export default GetHistoryBooking;