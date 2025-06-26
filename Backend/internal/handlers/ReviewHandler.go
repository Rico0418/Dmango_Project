package handlers

import (
	"context"
	"dmangoapp/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)
type ReviewHandler struct {
	DB *pgxpool.Pool
}
func (h *ReviewHandler) GetAllReviews(c *gin.Context) {
	query := `SELECT r.id, r.booking_id, rm.room_number, gh.name, r.guest_name, r.rating, r.comment, b.start_date, b.end_date, r.created_at FROM reviews r
	INNER JOIN bookings b ON r.booking_id = b.id
	INNER JOIN rooms rm ON b.room_id = rm.id
	INNER JOIN guest_house gh ON rm.guest_house_id = gh.id`
	var rows pgx.Rows
	var err error

	rows, err = h.DB.Query(context.Background(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		return
	}
	defer rows.Close()
	var reviews []models.Review
	for rows.Next() {
		var review models.Review
		if err := rows.Scan(&review.ID, &review.BookingID, &review.RoomNumber,
			&review.GuestHouseName, &review.GuestName, &review.Rating, &review.Comment, &review.StartDate, &review.EndDate, &review.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		reviews = append(reviews, review)
	}
	c.JSON(http.StatusOK, reviews)
}
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	var review models.Review

	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(context.Background(), `
		INSERT INTO reviews (booking_id, guest_name, rating,comment, created_at)
		VALUES ($1, $2, $3, $4,NOW())
		RETURNING id`, 
		review.BookingID,review.GuestName,review.Rating,review.Comment).Scan(&review.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Review created successfully", "review_id": review.ID})
}
func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	id := c.Param("id")
	var review models.Review

	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(context.Background(), `
		UPDATE reviews 
		SET rating = $1, comment = $2 
		WHERE id = $3`, review.Rating, review.Comment, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review updated successfully"})
}
func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec(context.Background(), `DELETE FROM reviews WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}