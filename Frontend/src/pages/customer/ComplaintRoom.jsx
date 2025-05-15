import { useEffect, useState } from "react";
import Footer from "../../components/organisms/Footer";
import Navbar from "../../components/organisms/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Tabs, Tab, Box, Typography, Button, Card, CardContent, Alert } from "@mui/material";
import axios from "axios";
import CreateComplaintDialog from "../../components/organisms/CreateComplaintForm";
import { toast } from "react-toastify";
const ComplaintRoom = () => {
    const { user } = useAuth();
    const [tabIndex, setTabIndex] = useState(0);
    const [payments, setPayments] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:8080/complaints/user/${user.id}`, {
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
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:8080/payments/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setError("Failed to fetch booking history");
            }
        };
        fetchPayments();
        fetchComplaints();
    }, [user.id]);
    const handleTabChange = (_, newValue) => {
        setTabIndex(newValue);
    };
    const handleDeleteComplaint = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/complaints/${id}`, {
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
    return (
        <div>
            <Navbar />
            <div style={{ padding: "2rem",minHeight: "75vh" }}>
                <Tabs value={tabIndex} onChange={handleTabChange} centered>
                    <Tab label="My Booked Rooms" sx={{ "&:focus": { outline: "none" } }} />
                    <Tab label="My Complaints" sx={{ "&:focus": { outline: "none" } }} />
                </Tabs>

                {tabIndex === 0 && (
                    <Box sx={{ mt: 3 }}>
                        {payments.length === 0 ? (
                            <Typography>No bookings available.</Typography>
                        ) : (
                            payments.map((payment) => (
                                <Card key={payment.id} sx={{  mb: 3, borderRadius: 2,
                                boxShadow: 3, border: "1px solid #e0e0e0", }}>
                                    <CardContent>
                                        <Typography variant="h6">
                                            Room #{payment.booking.room_number.trim()}
                                        </Typography>
                                        <Typography>Start Date: {new Date(payment.booking.start_date).toLocaleDateString()}</Typography>
                                        <Typography>End Date: {new Date(payment.booking.end_date).toLocaleDateString()}</Typography>
                                        {new Date(payment.booking.start_date).toLocaleDateString() === new Date().toLocaleDateString() && (
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
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box sx={{ mt: 3 }}>
                        {complaints.length === 0 ? (
                            <Typography>No complaints found.</Typography>
                        ) : (
                            complaints.map((complaint) => (
                                <Card key={complaint.id} sx={{  mb: 3, borderRadius: 2,
                                    boxShadow: 3, border: "1px solid #e0e0e0", }}>
                                    <CardContent>
                                        <Typography variant="h6">Room #{complaint.room_number}</Typography>
                                        <Typography>Description: {complaint.description}</Typography>
                                        <Typography>
                                            Date: {new Date(complaint.created_at).toLocaleDateString()}
                                        </Typography>
                                        <Typography>Status: {complaint.status}</Typography>

                                        <Box sx={{ mt: 2 }}>
                                            {complaint.status === "Pending" && (
                                                <Button variant="contained" color="warning" sx={{ mr: 1 }}>
                                                    Edit
                                                </Button>
                                            )}
                                            <Button variant="contained" color="error" onClick={() => handleDeleteComplaint(complaint.id)}>
                                                Delete
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </Box>
                )}
            </div>
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