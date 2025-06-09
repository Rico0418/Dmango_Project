import { useEffect, useState } from "react";
import Footer from "../../components/organisms/Footer";
import Navbar from "../../components/organisms/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Tabs, Tab, Box, Typography, Button, Card, CardContent, Alert } from "@mui/material";
import axios from "axios";
import CreateComplaintDialog from "../../components/organisms/CreateComplaintForm";
import { toast } from "react-toastify";
import EditComplaintForm from "../../components/organisms/EditComplaintForm";
const ComplaintRoom = () => {
    const { user } = useAuth();
    const [tabIndex, setTabIndex] = useState(0);
    const [payments, setPayments] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const today = new Date();

    const fetchComplaints = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/complaints/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching complaints:", err);
        }
    };

    useEffect(() => {
        if (!user || !user.id) return;
        const fetchPayments = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const acceptedPayments = Array.isArray(res.data)
                    ? res.data.filter((payment) => payment.status.trim().toLowerCase() === "accepted")
                    : [];
                setPayments(acceptedPayments);
            } catch (err) {
                setError("Failed to fetch booking history");
            }
        };
        fetchPayments();
        fetchComplaints();
    }, [user.id]);
    console.log(complaints)
    const handleTabChange = (_, newValue) => {
        setTabIndex(newValue);
    };
    const handleDeleteComplaint = async (id) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/complaints/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Delete Complaint Successfully");
            setComplaints((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Falied to delete complaint:", err);
            toast.error("Delete Complaint failed");
        }
    }

    const handleUpdateComplaint = async (id, description) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_URL}/complaints/description/${id}`,
                { description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Complaint updated successfully");
            fetchComplaints();
            setEditDialogOpen(false);
        } catch (err) {
            console.log(err);
            toast.error("Update complaint failed");
        }
    };

    return (
        <div>
            <Navbar />
            <div style={{ padding: "2rem", minHeight: "75vh" }}>
                <Tabs value={tabIndex} onChange={handleTabChange} centered>
                    <Tab label="My Booked Rooms" sx={{ "&:focus": { outline: "none" } }} />
                    <Tab label="My Complaints" sx={{ "&:focus": { outline: "none" } }} />
                </Tabs>

                {tabIndex === 0 && (
                    <Box sx={{ mt: 3 }}>
                        {payments.length === 0 ? (
                            <Typography>No bookings available.</Typography>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                {payments.filter((payment) => {
                                    const start = new Date(payment.booking.start_date);
                                    const end = new Date(payment.booking.end_date);
                                    const startDate = new Date(start.setHours(0, 0, 0, 0));
                                    const endDate = new Date(end.setHours(23, 59, 59, 999));
                                    return today >= startDate && today <= endDate;
                                }).map((payment) => {
                                    return (
                                        <Card key={payment.id} sx={{
                                            mb: 3, borderRadius: 2,
                                            boxShadow: 3, border: "1px solid #e0e0e0",
                                            maxWidth: 800, width: "100%"
                                        }}>
                                            <CardContent>

                                                <Typography variant="h6" color="primary">
                                                    {payment.guest_house_name} - Room #{payment.booking.room_number.trim()}
                                                </Typography>
                                                <Typography>Start Date: {new Date(payment.booking.start_date).toLocaleDateString()}</Typography>
                                                <Typography>End Date: {new Date(payment.booking.end_date).toLocaleDateString()}</Typography>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    sx={{ mt: 2 }}
                                                    onClick={() => {
                                                        setSelectedRoomId(payment.booking.room_id);
                                                        setOpenDialog(true);
                                                    }}
                                                >
                                                    Create Complaint
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box sx={{ mt: 3 }}>
                        {complaints.length === 0 ? (
                            <Typography>No complaints found.</Typography>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                {complaints.map((complaint) => {
                                    const relatedBooking = payments.find(payment =>
                                        payment.booking.room_id === complaint.room_id
                                    );
                                    let isWithinStay = false;
                                    if (relatedBooking) {
                                        const start = new Date(relatedBooking.booking.start_date);
                                        const end = new Date(relatedBooking.booking.end_date);
                                        const startDate = new Date(start.setHours(0, 0, 0, 0));
                                        const endDate = new Date(end.setHours(23, 59, 59, 999));
                                        isWithinStay = today >= startDate && today <= endDate;
                                    }
                                    return (
                                        <Card key={complaint.id} sx={{
                                            mb: 3, borderRadius: 2,
                                            boxShadow: 3, border: "1px solid #e0e0e0",
                                            maxWidth: 800, width: "100%"
                                        }}>
                                            <CardContent>
                                                <Typography variant="h6" color="primary">{complaint.guest_house_name} - Room #{complaint.room_number}</Typography>
                                                <Typography>Description: {complaint.description}</Typography>
                                                <Typography>
                                                    Date: {new Date(complaint.created_at).toLocaleDateString()}
                                                </Typography>
                                                <Typography>Status: {complaint.status}</Typography>

                                                <Box sx={{ mt: 2 }}>
                                                    {complaint.status === "Pending" && isWithinStay && (
                                                        <Button variant="contained" color="warning" sx={{ mr: 1 }} onClick={() => {
                                                            setSelectedComplaint(complaint);
                                                            setEditDialogOpen(true);
                                                        }}>
                                                            Edit
                                                        </Button>
                                                    )}
                                                    <Button variant="contained" color="error" onClick={() => handleDeleteComplaint(complaint.id)}>
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </Box>
                )}
            </div>
            <EditComplaintForm
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                complaint={selectedComplaint}
                onSubmit={handleUpdateComplaint}
            />
            <CreateComplaintDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                roomId={selectedRoomId}
                onComplaintCreated={fetchComplaints}
            />
            <Footer />
        </div>
    );
};
export default ComplaintRoom;