import { useEffect, useState } from "react";
import Footer from "../../components/organisms/Footer";
import Navbar from "../../components/organisms/Navbar";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Card, CardContent, Typography, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating } from "@mui/material";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import Pagination from "@mui/material/Pagination";
import logoImage from "../../assets/logo.jpg";
import signatureImage from "../../assets/signature.png";
import LoadingScreen from "../../utils/LoadingScreen";
import { toast } from "react-toastify";

const GetHistoryBooking = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [openReviewDialog, setOpenReviewDialog] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewedBookings, setReviewedBookings] = useState(new Set());
    const itemsPerPage = 2;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(payments.length / itemsPerPage);
    const [loading, setLoading] = useState(true);
    const handleChangePage = (event, value) => {
        setCurrentPage(value);
    }

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem("token");
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayments(Array.isArray(res.data) ? res.data : []);
                const reviewsRes = await axios.get(`${import.meta.env.VITE_API_URL}/reviews`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const temp = (Array.isArray(reviewsRes.data) ? res.data : []);
                const reviewedBookingIds = new Set(temp.map((review) => review.booking_id));
                setReviewedBookings(reviewedBookingIds);
            } catch (err) {
                toast.error("Failed to fetch booking history");
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [user.id]);
    console.log(payments);
    const handleWhatsAppRedirect = (payment) => {
        const PhoneNumber = import.meta.env.VITE_OWNER_PHONE_NUMBER;
        const message = `Order D'mango Detail:\nBooking ID: ${payment.booking.id}\nName: ${payment.booking.name}\nEmail: ${payment.booking.email}\nRoom Number: ${payment.booking.room_number.trim()}\nStart-date: ${new Date(payment.booking.start_date).toLocaleDateString()}\nEnd-date: ${new Date(payment.booking.end_date).toLocaleDateString()}\nAmount: Rp ${payment.amount.toLocaleString()}\n 
Berikut pesanan saya yang saya sudah buat di web
        `.trim();
        const url = `https://wa.me/${PhoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const numberToWords = (num) => {
        const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"];
        const teens = ["Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas", "Enam Belas", "Tujuh Belas", "Delapan Belas", "Sembilan Belas"];
        const tens = ["", "", "Dua Puluh", "Tiga Puluh", "Empat Puluh", "Lima Puluh", "Enam Puluh", "Tujuh Puluh", "Delapan Puluh", "Sembilan Puluh"];

        if (num === 0) return "Nol";
        if (num < 0) return "Minus " + numberToWords(Math.abs(num));
        if (num <= 9) return units[num];
        if (num <= 19) return teens[num - 10];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "");
        if (num < 1000) return units[Math.floor(num / 100)] + " Ratus" + (num % 100 ? " " + numberToWords(num % 100) : "");
        if (num < 2000000) return numberToWords(Math.floor(num / 1000)) + " Ribu" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
        if (num < 2000000000) return numberToWords(Math.floor(num / 1000000)) + " Juta" + (num % 1000000 ? " " + numberToWords(num % 1000000) : "");

        return "Terlalu Besar";
    };

    const handleDownloadInvoice = async (payment) => {
        const wb = new Workbook();
        const ws = wb.addWorksheet("Invoice");

        const logoBuffer = await fetch(logoImage).then(res => res.arrayBuffer());
        const signatureBuffer = await fetch(signatureImage).then(res => res.arrayBuffer());

        const logoImageId = wb.addImage({
            buffer: logoBuffer,
            extension: "jpg",
        });
        ws.addImage(logoImageId, {
            tl: { col: 0, row: 1 },
            br: { col: 1, row: 17 },
            ext: { width: 101, height: 295 },
            editAs: "absolute"
        });


        const signatureImageId = wb.addImage({
            buffer: signatureBuffer,
            extension: "png",
        });
        ws.addImage(signatureImageId, {
            tl: { col: 3, row: 13 },
            br: { col: 4, row: 16 },
            ext: { width: 83, height: 54 },
            editAs: "absolute"
        });


        const invoiceNo = `001-2/${new Date(payment.booking.start_date).toLocaleString("default", { month: "short" }).toUpperCase()}/01/${new Date(payment.booking.start_date).getFullYear()}`;
        ws.getCell("B2").value = "No :";
        ws.getCell("C2").value = invoiceNo;
        ws.getCell("B3").value = "Telah terima dari :";
        ws.getCell("C3").value = payment.booking.name;
        ws.getCell("B4").value = "Uang sejumlah :";
        ws.getCell("C4").value = numberToWords(payment.amount) + " Rupiah";
        ws.getCell("B5").value = "Untuk pembayaran :";


        ws.getCell("B7").value = "Keterangan";
        ws.getCell("C7").value = "Harga";
        ws.getCell("D7").value = "Discount";
        ws.getCell("E7").value = "Netto";
        ws.getCell("B8").value = "Uang Jaminan Kamar Kost";
        ws.getCell("B9").value = "V";
        ws.getCell("C9").value = "Sewa Kost";
        ws.getCell("E9").value = { formula: `Rp ${payment.amount.toLocaleString()}`, result: payment.amount };
        ws.getCell("B10").value = "-";
        ws.getCell("C10").value = "Periode";
        ws.mergeCells("D10:E10");
        ws.getCell("D10").value = `${new Date(payment.booking.start_date).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/-/g, " / ")} - ${new Date(payment.booking.end_date).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/-/g, " / ")}`;
        ws.getCell("B11").value = "-";
        ws.getCell("C11").value = "Kamar No.";
        ws.mergeCells("D11:E11");
        ws.getCell("D11").value = `#${payment.booking.room_number.trim()}`;


        ws.getCell("B12").value = "";


        ws.getCell("B13").value = "Total";
        ws.getCell("C13").value = "Rp";
        ws.getCell("E13").value = { formula: `Rp ${payment.amount.toLocaleString()}`, result: payment.amount };
        ws.mergeCells("D17:E17");
        ws.getCell("D17").value = `Semarang, ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/-/g, " / ")}`;


        ws.getColumn(1).width = 14.45;
        ws.getColumn(2).width = 24.36;
        ws.getColumn(3).width = 40.09;
        ws.getColumn(4).width = 14.36;
        ws.getColumn(5).width = 9.36;


        const headerCells = ["B7", "C7", "D7", "E7"];
        headerCells.forEach(cell => {
            ws.getCell(cell).alignment = { horizontal: "center" };
            ws.getCell(cell).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF999999" }
            };
            ws.getCell(cell).font = { size: 11 };
        });

        // Add borders to A2:E17
        for (let row = 2; row <= 17; row++) {
            for (let col = 1; col <= 5; col++) {
                const cell = ws.getCell(row, col);
                cell.border = {
                    top: { style: "medium" },
                    left: { style: "medium" },
                    bottom: { style: "medium" },
                    right: { style: "medium" }
                };
            }
        }


        const buffer = await wb.xlsx.writeBuffer();
        const fileName = `Invoice_Booking_${payment.booking.name}_${new Date().toISOString().split("T")[0]}.xlsx`;
        saveAs(new Blob([buffer]), fileName);
    }
    const handleOpenReviewDialog = (bookingId) => {
        setSelectedBookingId(bookingId);
        setReviewRating(0);
        setReviewComment("");
        setOpenReviewDialog(true);
    }
    const handleCloseReviewDialog = () => {
        setOpenReviewDialog(false);
        setSelectedBookingId(null);
    }
    const handleSubmitReview = async () => {
        if (!reviewRating || !reviewComment.trim()) {
            toast.error("Please provide a rating and comment");
            return;
        }
        const payment = payments.find(p => p.booking.id === selectedBookingId);
        if (!payment) {
            toast.error("Payment data not found for this booking");
            return;
        }
        try {
            const token = sessionStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/reviews`,
                {
                    booking_id: selectedBookingId,
                    guest_name: payment.booking.name,
                    rating: reviewRating,
                    comment: reviewComment,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success("Review submitted successfully");
            setReviewedBookings((prev) => new Set([...prev, selectedBookingId]));
            handleCloseReviewDialog();
        } catch (err) {
            toast.error("Failed to submit review");
            console.error(err);
        }
    };
    const isReviewEligible = (payment) => {
        return (
            payment.status.trim().toLowerCase() === "accepted" && new Date(payment.booking.end_date) <= new Date()
        )
    }
    if (loading) return <LoadingScreen />;
    return (
        <div>
            <Navbar />
            <div style={{ padding: "2rem", minHeight: "90vh" }}>
                <Typography variant="h4" gutterBottom>
                    Booking History
                </Typography>
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
                                                sx={{ textTransform: "none", "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}
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
                                                sx={{ textTransform: "none", "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" , minWidth: "300px"} }}
                                            >
                                                Download Invoice
                                            </Button>
                                        </Box>
                                    )}
                                    {isReviewEligible(payment) && (
                                        <Box sx={{ padding: 1 }}>
                                            <Button
                                                variant="contained"
                                                color="info"
                                                size="small"
                                                onClick={() => handleOpenReviewDialog(payment.booking.id)}
                                                sx={{
                                                    textTransform: "none",
                                                    "&:focus": { outline: "none", boxShadow: "none" },
                                                    "&:active": { outline: "none", boxShadow: "none" },
                                                    minWidth: "130px"
                                                }}
                                            >
                                                Write Review
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
                                sx={{ mt: 2, "& .MuiPaginationItem-root": { outline: "none !important" }, "& .Mui-selected": { outline: "none !important" }, "& .MuiPaginationItem-root.Mui-selected:focus": { outline: "none !important", boxShadow: "none" }, "& .MuiPaginationItem-root:focus": { outline: "none !important", boxShadow: "none" } }}
                            />
                        )}
                    </div>
                )}
            </div>
            <Dialog open={openReviewDialog} onClose={handleCloseReviewDialog}>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Rating
                        </Typography>
                        <Rating
                            value={reviewRating}
                            onChange={(event, newValue) => setReviewRating(newValue)}
                            size="large"
                        />
                    </Box>
                    <TextField
                        label="Comment"
                        multiline
                        rows={4}
                        fullWidth
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseReviewDialog}
                        sx={{
                            textTransform: "none",
                            "&:focus": { outline: "none", boxShadow: "none" },
                            "&:active": { outline: "none", boxShadow: "none" },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitReview}
                        variant="contained"
                        color="primary"
                        sx={{
                            textTransform: "none",
                            "&:focus": { outline: "none", boxShadow: "none" },
                            "&:active": { outline: "none", boxShadow: "none" },
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Footer />
        </div>
    );
}
export default GetHistoryBooking;