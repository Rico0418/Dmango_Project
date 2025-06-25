import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { Card, CardContent, Typography, Alert, Box, Rating, Pagination } from "@mui/material";
import LoadingScreen from "../utils/LoadingScreen";
import Navbar from "../components/organisms/Navbar";
import Footer from "../components/organisms/Footer";

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemPerPage = 5;
    const indexOfLastItem = currentPage * itemPerPage;
    const indexOfFirstItem = indexOfLastItem - itemPerPage;
    const currentItems = reviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reviews.length / itemPerPage);
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
    const handleChangePage = (event, value) => {
        setCurrentPage(value);
    }
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
            <Footer />
        </>
    );
}
export default ReviewsPage;