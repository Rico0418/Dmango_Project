package handlers

import (
	"context"
	"dmangoapp/internal/models"
	"net/http"


	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	DB *pgxpool.Pool
}


//Handler for payments
func (h *Handler) GetAllPayments(c *gin.Context) {
	rows, err := h.DB.Query(context.Background(), `
		SELECT p.id, p.booking_id, p.amount, p.method, p.status, p.created_at,
		       b.id, b.room_id, rm.room_number, b.user_id, u.email, b.start_date, b.end_date, b.status
		FROM payments p
		INNER JOIN bookings b ON p.booking_id = b.id
		INNER JOIN rooms rm ON b.room_id = rm.id
		INNER JOIN users u ON b.user_id = u.id
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var payments []models.Payment
	for rows.Next() {
		var payment models.Payment
		var booking models.Booking

		if err := rows.Scan(&payment.ID, &payment.BookingID, &payment.Amount, &payment.Method, &payment.Status, &payment.CreatedAt,
			&booking.ID, &booking.RoomID, &booking.RoomNumber, &booking.UserID, &booking.UserEmail, &booking.StartDate, &booking.EndDate, &booking.Status); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		payment.Booking = &booking
		payments = append(payments, payment)
	}

	c.JSON(http.StatusOK, payments)
}
func (h *Handler) GetPaymentDetailbyUserID(c *gin.Context) {
	userID := c.Param("user_id")
	query := `
		SELECT p.id, gh.name,p.booking_id, p.amount, p.method, p.status, p.created_at,
		b.id, b.user_id, u.name ,u.email, b.room_id, rm.room_number, b.start_date, b.end_date, b.status
		FROM payments p
		INNER JOIN bookings b ON p.booking_id = b.id
		INNER JOIN rooms rm ON b.room_id = rm.id
		INNER JOIN guest_house gh ON rm.guest_house_id = gh.id
		INNER JOIN users u ON b.user_id = u.id
		WHERE b.user_id = $1
		ORDER BY p.created_at DESC`

	rows, err := h.DB.Query(context.Background(), query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}
	defer rows.Close()

	var payments []models.Payment

	for rows.Next() {
		var payment models.Payment
		var booking models.Booking

		err := rows.Scan(
			&payment.ID, &payment.GuestHouseName, &payment.BookingID, &payment.Amount, &payment.Method, &payment.Status, &payment.CreatedAt,
			&booking.ID, &booking.UserID, &booking.UserName, &booking.UserEmail, &booking.RoomID, &booking.RoomNumber,
			&booking.StartDate, &booking.EndDate, &booking.Status,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning data"})
			return
		}

		payment.Booking = &booking
		payments = append(payments, payment)
	}

	c.JSON(http.StatusOK, payments)
}
func (h *Handler) DownloadPaymentByMonth(c *gin.Context){
	month := c.Query("month")
	year := c.Query("year")
	if month == "" || year == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "month and year query parameters are required"})
		return
	}
	query := `
		SELECT p.id, gh.name, p.booking_id, p.amount, p.method, p.status, p.created_at,
		       b.id, b.user_id, u.name, u.email, b.room_id, rm.room_number, 
		       b.start_date, b.end_date, b.status
		FROM payments p
		INNER JOIN bookings b ON p.booking_id = b.id
		INNER JOIN rooms rm ON b.room_id = rm.id
		INNER JOIN guest_house gh ON rm.guest_house_id = gh.id
		INNER JOIN users u ON b.user_id = u.id
		WHERE EXTRACT(MONTH FROM p.created_at) = $1 AND EXTRACT(YEAR FROM p.created_at) = $2
		ORDER BY p.created_at DESC;
	`
	rows, err := h.DB.Query(context.Background(), query, month, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}
	defer rows.Close()
	var payments []models.Payment

	for rows.Next() {
		var payment models.Payment
		var booking models.Booking

		err := rows.Scan(
			&payment.ID, &payment.GuestHouseName, &payment.BookingID, &payment.Amount, &payment.Method, &payment.Status, &payment.CreatedAt,
			&booking.ID, &booking.UserID, &booking.UserName, &booking.UserEmail, &booking.RoomID, &booking.RoomNumber,
			&booking.StartDate, &booking.EndDate, &booking.Status,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning data"})
			return
		}

		payment.Booking = &booking
		payments = append(payments, payment)
	}

	c.JSON(http.StatusOK, payments)
}
func (h *Handler) CreatePayment(c *gin.Context) {
	var payment models.Payment

	if err := c.ShouldBindJSON(&payment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(context.Background(), `
		INSERT INTO payments (booking_id, amount, method, created_at)
		VALUES ($1, $2, 'Virtual Account', NOW())
		RETURNING id`, payment.BookingID, payment.Amount).Scan(&payment.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Payment created successfully", "payment_id": payment.ID})
}
func (h *Handler) DeletePayment(c *gin.Context) {
	id := c.Param("id")

	tx, err := h.DB.Begin(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback(context.Background()) 

	
	var bookingID int
	var roomID int
	err = tx.QueryRow(context.Background(), `SELECT b.id, b.room_id
	FROM payments p JOIN bookings b ON p.booking_id = b.id WHERE p.id=$1`, id).Scan(&bookingID,&roomID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	result, err := tx.Exec(context.Background(), "DELETE FROM payments WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete payment"})
		return
	}
	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	_, err = tx.Exec(context.Background(), "DELETE FROM bookings WHERE id = $1", bookingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete booking"})
		return
	}

	if err := tx.Commit(context.Background()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment and associated booking deleted successfully"})
}
func (h *Handler) UpdatePaymentStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status"`
	}

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Start transaction
	tx, err := h.DB.Begin(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback(context.Background()) // Rollback if something fails

	// Update payment status
	_, err = tx.Exec(context.Background(), "UPDATE payments SET status = $1 WHERE id = $2", req.Status, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var bookingID, roomID int

	// Get booking ID and room ID from the payment
	err = tx.QueryRow(context.Background(), "SELECT booking_id FROM payments WHERE id = $1", id).Scan(&bookingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get room ID from the booking
	err = tx.QueryRow(context.Background(), "SELECT room_id FROM bookings WHERE id = $1", bookingID).Scan(&roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Handle different payment statuses
	switch req.Status {
	case "accepted":

		_, err = tx.Exec(context.Background(), "UPDATE bookings SET status = 'confirmed' WHERE id = $1", bookingID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

	case "canceled":


		_, err = tx.Exec(context.Background(), "UPDATE bookings SET status = 'canceled' WHERE id = $1", bookingID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		_, err = tx.Exec(context.Background(), "UPDATE rooms SET status = 'available' WHERE id = $1", roomID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(context.Background()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment status updated successfully"})
}

func (h *Handler) UpdatePaymentMethod(c *gin.Context) {
	id := c.Param("id")
	var payment models.Payment

	if err := c.ShouldBindJSON(&payment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(context.Background(), `
		UPDATE payments 
		SET method = $1 
		WHERE id = $2`, payment.Method, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment-Method updated successfully"})
}


