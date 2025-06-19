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

    const handleDownloadInvoice = (payment) => {
        const wb = XLSX.utils.book_new();
        const wsData = [];

        const invoiceNo = `001-2/${new Date(payment.booking.start_date).toLocaleString("default", { month: "short" }).toUpperCase()}/01/${new Date(payment.booking.start_date).getFullYear()}`;
        wsData.push([{ t: "s", v: "No :" }, { t: "s", v: invoiceNo }, {}, {}, {}]);
        wsData.push([{ t: "s", v: "Telah terima dari :" }, { t: "s", v: payment.booking.name }, {}, {}, {}]);
        wsData.push([{ t: "s", v: "Uang sejumlah :" }, { t: "s", v: numberToWords(payment.amount) + " Rupiah" }, {}, {}, {}]);
        wsData.push([{ t: "s", v: "Untuk pembayaran :" }, { t: "s", v: "" }, {}, {}, {}]);

        wsData.push([{ t: "s", v: "Keterangan" }, {}, {}, {}, {}]);
        wsData.push([{ t: "s", v: "Uang Jaminan Kamar Kost" }, {}, {}, {}, {}]);
        wsData.push([{ t: "s", v: "V" }, { t: "s", v: "Sewa Kost" }, {}, {}, { t: "n", v: payment.amount, s: { numFmt: "Rp #,##0" } }]);
        wsData.push([{ t: "s", v: "-" }, { t: "s", v: "Periode" }, { t: "s", v: `${new Date(payment.booking.start_date).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/-/g, " / ")} - ${new Date(payment.booking.end_date).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/-/g, " / ")}` }, {}, {}]);
        wsData.push([{ t: "s", v: "-" }, { t: "s", v: "Kamar No." }, { t: "s", v: `#${payment.booking.room_number.trim()}` }, {}, {}]);

        wsData.push([{}, {}, {}, {}, {}]);

        wsData.push([{ t: "s", v: "Total" }, {t: "s", v: "Rp"},{}, { t: "n", v: payment.amount, s: { numFmt: "Rp #,##0", alignment: { horizontal: "right" } } }]);
        wsData.push([{}, {}, {}, { t: "s", v: `Semarang, ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/-/g, " / ")}` }, {}]);
        wsData.push([{}, {}, {}, { t: "s", v: "" }, {}]); // Placeholder for signature

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);


        ws["!merges"] = [
            { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } }, // No
            { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } }, // Telah terima dari
            { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } }, // Uang sejumlah
            { s: { r: 3, c: 1 }, e: { r: 3, c: 4 } }, // Untuk pembayaran
            { s: { r: 5, c: 1 }, e: { r: 5, c: 4 } }, // Uang Jaminan Kamar Kost
            { s: { r: 9, c: 1 }, e: { r: 9, c: 4 } }, // Rp total
        ];

        // Set column widths
        ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 10 }];

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Invoice");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const fileName = `Invoice_Booking_${payment.booking.name}_${new Date().toISOString().split("T")[0]}.xlsx`;
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
                                                sx={{ textTransform: "none", "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}
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
                                sx={{ mt: 2, "& .MuiPaginationItem-root": { outline: "none !important" }, "& .Mui-selected": { outline: "none !important" }, "& .MuiPaginationItem-root.Mui-selected:focus": { outline: "none !important", boxShadow: "none" }, "& .MuiPaginationItem-root:focus": { outline: "none !important", boxShadow: "none" } }}
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