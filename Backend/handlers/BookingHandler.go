package handlers

import (
	"context"
	"dmangoapp/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BookingHandler struct {
	DB *pgxpool.Pool
}
func (h *BookingHandler) GetAllBookings(c *gin.Context) {
	rows, err := h.DB.Query(context.Background(),
		`SELECT b.id, b.room_id, rm.room_number, b.user_id, u.email, b.start_date, b.end_date, b.status,b.created_at
		FROM bookings b
		INNER JOIN rooms rm ON b.room_id = rm.id
		INNER JOIN users u ON b.user_id = u.id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var bookings []models.Booking
	for rows.Next(){
		var booking models.Booking
		if err := rows.Scan(&booking.ID, &booking.RoomID, &booking.RoomNumber, 
			&booking.UserID, &booking.UserEmail, &booking.StartDate, &booking.EndDate, &booking.Status, &booking.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		bookings = append(bookings, booking)
	}
	c.JSON(http.StatusOK, bookings)
}
func (h *BookingHandler) GetDetailBooking(c *gin.Context) {
	id := c.Param("id")

	query := `
		SELECT b.id, b.room_id, rm.room_number, b.user_id, u.email, b.start_date, b.end_date, b.status, b.created_at
		FROM bookings b
		INNER JOIN rooms rm ON b.room_id = rm.id
		INNER JOIN users u ON b.user_id = u.id
		WHERE b.id = $1
	`

	var booking models.Booking
	err := h.DB.QueryRow(context.Background(), query, id).Scan(
		&booking.ID, &booking.RoomID, &booking.RoomNumber,
		&booking.UserID, &booking.UserEmail, &booking.StartDate,
		&booking.EndDate, &booking.Status, &booking.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, booking)
}

func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req models.BookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	layout := "2006-01-02"
	startDate, err := time.Parse(layout, req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date"})
		return
	}
	endDate, err := time.Parse(layout, req.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date"})
		return
	}

	var bookingID int
	err = h.DB.QueryRow(context.Background(), `
		INSERT INTO bookings (room_id, user_id, start_date, end_date, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id`,
		req.RoomID, req.UserID, startDate, endDate).Scan(&bookingID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "booking_id": bookingID})
}

func (h *BookingHandler) DeleteBooking(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec(context.Background(), "DELETE FROM bookings WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking deleted successfully"})
}