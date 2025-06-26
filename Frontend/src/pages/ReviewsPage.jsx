import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { Card, CardContent, Typography, Alert, Box, Rating, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import LoadingScreen from "../utils/LoadingScreen";
import Navbar from "../components/organisms/Navbar";
import Footer from "../components/organisms/Footer";
import { useAuth } from "../context/AuthContext";

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemPerPage = 5;
    const indexOfLastItem = currentPage * itemPerPage;
    const indexOfFirstItem = indexOfLastItem - itemPerPage;
    const currentItems = reviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reviews.length / itemPerPage);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");
    const { user } = useAuth();
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem("token");
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/reviews`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReviews(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                toast.error("Failed to fetch reviews");
                console.log(err);
            } finally {
                setLoading(false);
            };
        }
        fetchReviews();
    }, []);
    useEffect(() => {
        const fetchUsersAndIdentify = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem("token");
                const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const users = Array.isArray(usersRes.data) ? usersRes.data : [];
                const matchedUser = users.find(u => u.id === user.id);
                setCurrentUser(matchedUser);
            } catch (err) {
                toast.error("Failed to fetch user");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsersAndIdentify();
    }, [])
    const handleChangePage = (event, value) => {
        setCurrentPage(value);
    }
    const handleOpenEdit = (review) => {
        setEditingReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment);
    }
    const handleCloseEdit = () => {
        setEditingReview(null);
        setEditRating(0);
        setEditComment("");
    }
    const handleSubmitEdit = async () => {
        if (!editRating || !editComment.trim()) {
            toast.error("Please provide a rating and comment");
            return;
        }
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_URL}/reviews/${editingReview.id}`, {
                rating: editRating,
                comment: editComment,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Review updated");
            handleCloseEdit();
            setReviews(prev => prev.map(r => r.id === editingReview.id ? { ...r, rating: editRating, comment: editComment } : r));
        } catch (err) {
            toast.error("Failed to update review");
            console.error(err);
        }
    }
    const handleDelete = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Review deleted");
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (err) {
            toast.error("Failed to delete review");
            console.error(err);
        }
    };
    const averageRating = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0;
    if (loading) return <LoadingScreen />;
    return (
        <>
            <Helmet>
                <title>Reviews - D'mango Guest House Semarang</title>
                <meta
                    name="description"
                    content="Read guest reviews for D'mango Guest House in Semarang. See ratings, comments, and experiences for our affordable rooms with AC, TV, and private bathrooms."
                />
                <meta name="keywords" content="guest house Semarang reviews, D'mango Guest House reviews, Semarang accommodation feedback" />
                <link rel="canonical" href="https://dmangoguesthouse.com/reviews" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Hotel",
                        "name": "D'mango Guest House Semarang",
                        "url": "https://dmangoguesthouse.com",
                        "aggregateRating": reviews.length
                            ? {
                                "@type": "AggregateRating",
                                "ratingValue": averageRating,
                                "reviewCount": reviews.length,
                            }
                            : undefined,
                        "review": reviews.map((review) => ({
                            "@type": "Review",
                            "author": { "@type": "Person", "name": review.guest_name },
                            "datePublished": review.created_at.substring(0, 10),
                            "reviewRating": {
                                "@type": "Rating",
                                "ratingValue": review.rating,
                            },
                            "description": review.comment,
                        })),
                    })}
                </script>
            </Helmet>
            <Navbar />
            <Box sx={{ padding: "2rem", minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Guest Reviews
                </Typography>
                {reviews.length === 0 ? (
                    <Typography>No reviews found.</Typography>
                ) : (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Average Rating: {averageRating} / 5 ({reviews.length} reviews)
                        </Typography>
                        {currentItems.map((review) => (
                            <Card
                                key={review.id}
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    boxShadow: 3,
                                    border: "1px solid #e0e0e0",
                                    maxWidth: 800,
                                    width: "100%",
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        {review.guest_house_name} - Room #{review.room_number}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                                        <Rating value={review.rating} readOnly size="small" />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            ({review.rating}/5)
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1">
                                        <strong>Guest:</strong> {review.guest_name}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>From:</strong>  {new Date(review.start_date).toLocaleDateString("id-ID", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })} <strong> - To: </strong>  {new Date(review.end_date).toLocaleDateString("id-ID", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Comment:</strong> {review.comment}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Reviewed on:</strong>{" "}
                                        {new Date(review.created_at).toLocaleDateString("id-ID", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </Typography>
                                    {currentUser && currentUser.name === review.guest_name && (
                                        <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center", justifyContent: "center" }}>
                                            <Box>
                                                <Button variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleOpenEdit(review)}
                                                    sx={{
                                                        "&:focus": { outline: "none", boxShadow: "none" },
                                                        "&:active": { outline: "none", boxShadow: "none" },
                                                    }}>Edit</Button>
                                                <Button variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDelete(review.id)} sx={{
                                                        marginLeft: '1rem', color: 'white',
                                                        "&:focus": { outline: "none", boxShadow: "none" },
                                                        "&:active": { outline: "none", boxShadow: "none" },
                                                    }}>Delete</Button>
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        {reviews.length > itemPerPage && (
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handleChangePage}
                                color="primary"
                                sx={{
                                    mt: 2,
                                    "& .MuiPaginationItem-root": { outline: "none !important" },
                                    "& .Mui-selected": { outline: "none !important" },
                                    "& .MuiPaginationItem-root.Mui-selected:focus": { outline: "none !important", boxShadow: "none" },
                                    "& .MuiPaginationItem-root:focus": { outline: "none !important", boxShadow: "none" },
                                }}
                            />
                        )}
                    </>
                )}
            </Box>
            <Dialog open={!!editingReview} onClose={handleCloseEdit}>
                <DialogTitle>Edit Review</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1">Rating</Typography>
                        <Rating
                            value={editRating}
                            onChange={(e, newValue) => setEditRating(newValue)}
                            size="large"
                        />
                    </Box>
                    <TextField
                        label="Comment"
                        multiline
                        rows={4}
                        fullWidth
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit} sx={{
                                                    "&:focus": { outline: "none", boxShadow: "none" },
                                                    "&:active": { outline: "none", boxShadow: "none" }, }}>Cancel</Button>
                    <Button onClick={handleSubmitEdit} variant="contained" color="primary" sx={{ 
                                                    "&:focus": { outline: "none", boxShadow: "none" },
                                                    "&:active": { outline: "none", boxShadow: "none" }, }}>Save</Button>
                </DialogActions>
            </Dialog>
            <Footer />
        </>
    );
}
export default ReviewsPage;