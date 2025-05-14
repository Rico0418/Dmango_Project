package handlers

import (
	"context"
	"dmangoapp/models"
	"dmangoapp/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	DB *pgxpool.Pool
}

// handler for models Guest House
func (h *Handler) GetAllGuestHouses(c *gin.Context) {
	rows, err := h.DB.Query(context.Background(), `SELECT * FROM guest_house`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		return
	}
	defer rows.Close()
	var guestHouse []models.GuestHouse
	for rows.Next() {
		var gh models.GuestHouse
		if err := rows.Scan(&gh.ID, &gh.AdminID, &gh.Name, &gh.Location); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		guestHouse = append(guestHouse, gh)
	}
	c.JSON(http.StatusOK, guestHouse)
}
func (h *Handler) GetDetailGuestHouses(c *gin.Context) {
	id := c.Param("id")
	var guestHouse models.GuestHouse
	err := h.DB.QueryRow(context.Background(), "SELECT id, admin_id,name,location FROM guest_house WHERE id = $1", id).
		Scan(&guestHouse.ID, &guestHouse.AdminID, &guestHouse.Name, &guestHouse.Location)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guest House not found"})
		return
	}
	c.JSON(http.StatusOK, guestHouse)
}

// Handlers for models Rooms
func (h *Handler) GetAllRooms(c *gin.Context) {
	rows, err := h.DB.Query(context.Background(), `SELECT * FROM rooms`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		return
	}
	defer rows.Close()
	var rooms []models.Room
	for rows.Next() {
		var room models.Room
		if err := rows.Scan(&room.ID, &room.GuestHouseID, &room.RoomNumber, &room.Type, &room.PricePerDay, &room.PricePerMonth, &room.Status); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		rooms = append(rooms, room)
	}
	c.JSON(http.StatusOK, rooms)
}

func (h *Handler) GetDetailRoom(c *gin.Context) {
	id := c.Param("id")
	roomNumber := c.Query("room_number")

	var room models.Room
	var err error

	if roomNumber != "" {
		err = h.DB.QueryRow(context.Background(), `
			SELECT id, guest_house_id, room_number, type, price_per_day, price_per_month, status 
			FROM rooms WHERE room_number = $1`, roomNumber).
			Scan(&room.ID, &room.GuestHouseID, &room.RoomNumber, &room.Type, &room.PricePerDay, &room.PricePerMonth, &room.Status)
	} else {
		err = h.DB.QueryRow(context.Background(), `
			SELECT id, guest_house_id, room_number, type, price_per_day, price_per_month, status 
			FROM rooms WHERE id = $1`, id).
			Scan(&room.ID, &room.GuestHouseID, &room.RoomNumber, &room.Type, &room.PricePerDay, &room.PricePerMonth, &room.Status)
	}

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	c.JSON(http.StatusOK, room)
}

func (h *Handler) UpdateRoomPrice(c *gin.Context) {
	id := c.Param("id")

	var room models.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(context.Background(), `
		UPDATE rooms 
		SET price_per_day = $1, price_per_month = $2 
		WHERE id = $3`, 
		room.PricePerDay, room.PricePerMonth, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found or no updates applied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Room updated successfully"})
}


// Handler for users
func (h *Handler) Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = hashedPassword
	_, err = h.DB.Exec(context.Background(),
		"INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", user.Name,user.Email, user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func (h *Handler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	err := h.DB.QueryRow(context.Background(),
		"SELECT id, email, password, role FROM users WHERE email = $1", req.Email).
		Scan(&user.ID, &user.Email, &user.Password, &user.Role)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if !utils.CheckPassword(user.Password, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}
func (h *Handler) GetDetailUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	err := h.DB.QueryRow(context.Background(), "SELECT id,name,email,password FROM users WHERE id = $1", id).
		Scan(&user.ID, &user.Name, &user.Email, &user.Password)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
	})
}
func (h *Handler) UpdatePassword(c *gin.Context) {
	userID := c.GetInt("user_id")
	fmt.Println("User ID from token:", userID)

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch current password
	var currentHashedPassword string
	err := h.DB.QueryRow(context.Background(),
		"SELECT password FROM users WHERE id = $1", userID).Scan(&currentHashedPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Check old password
	if !utils.CheckPassword(currentHashedPassword, req.OldPassword) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect old password"})
		return
	}

	// Hash new password
	newHashedPassword, _ := utils.HashPassword(req.NewPassword)
	_, err = h.DB.Exec(context.Background(),
		"UPDATE users SET password = $1 WHERE id = $2", newHashedPassword, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

// Handler for complaints
func (h *Handler) GetAllComplaints(c *gin.Context) {
	rows, err := h.DB.Query(context.Background(),
		`SELECT c.id, c.room_id, rm.room_number, c.user_id, u.email, c.description, c.status, c.created_at
		FROM complaints c
		INNER JOIN rooms rm ON c.room_id = rm.id
		INNER JOIN users u ON c.user_id = u.id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var complaints []models.Complaint
	for rows.Next(){
		var complaint models.Complaint
		if err := rows.Scan(&complaint.ID, &complaint.RoomID, &complaint.RoomNumber, 
			&complaint.UserID, &complaint.UserEmail, &complaint.Description, &complaint.Status, &complaint.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		complaints = append(complaints, complaint)
	}
	c.JSON(http.StatusOK, complaints)
}
func (h *Handler) GetDetailComplaint(c *gin.Context) {
	id := c.Param("id")
	roomNumber := c.Query("room_number")
	var complaint models.Complaint
	var err error
	if roomNumber != "" {
		err = h.DB.QueryRow(context.Background(), `
		SELECT c.id, c.room_id, rm.room_number, c.user_id, u.email, c.description, c.status, c.created_at
		FROM complaints c
		INNER JOIN rooms rm ON c.room_id = rm.id
		INNER JOIN users u ON c.user_id = u.id
		WHERE c.id = $1`, roomNumber).Scan(
		&complaint.ID, &complaint.RoomID, &complaint.RoomNumber, &complaint.UserID, &complaint.UserEmail,
		&complaint.Description, &complaint.Status, &complaint.CreatedAt,
		)
	}else{
		err = h.DB.QueryRow(context.Background(), `
		SELECT c.id, c.room_id, rm.room_number, c.user_id, u.email, c.description, c.status, c.created_at
		FROM complaints c
		INNER JOIN rooms rm ON c.room_id = rm.id
		INNER JOIN users u ON c.user_id = u.id
		WHERE c.id = $1`, id).Scan(
		&complaint.ID, &complaint.RoomID, &complaint.RoomNumber, &complaint.UserID, &complaint.UserEmail,
		&complaint.Description, &complaint.Status, &complaint.CreatedAt,
		)
	}
	
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Complain not found"})
		return
	}
	c.JSON(http.StatusOK, complaint)
}
func (h *Handler) CreateComplaint(c *gin.Context) {
	var complaint models.Complaint

	if err := c.ShouldBindJSON(&complaint); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(context.Background(), `
		INSERT INTO complaints (room_id, user_id, description, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id`, 
		complaint.RoomID, complaint.UserID, complaint.Description).Scan(&complaint.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Complaint created successfully", "complaint_id": complaint.ID})
}

func (h *Handler) UpdateComplaintStatus(c *gin.Context) {
	id := c.Param("id")
	var complaint models.Complaint

	if err := c.ShouldBindJSON(&complaint); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(context.Background(), `
		UPDATE complaints 
		SET status = $1 
		WHERE id = $2`, complaint.Status, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Complaint not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Complaint updated successfully"})
}
func (h *Handler) UpdateComplaintDescription(c *gin.Context) {
	id := c.Param("id")
	var complaint models.Complaint

	if err := c.ShouldBindJSON(&complaint); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(context.Background(), `
		UPDATE complaints 
		SET description = $1 
		WHERE id = $2`, complaint.Description, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Complaint not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Complaint updated successfully"})
}

func (h *Handler) DeleteComplaint(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec(context.Background(), `DELETE FROM complaints WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Complaint not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Complaint deleted successfully"})
}
// handlers for bookings
func (h *Handler) GetAllBookings(c *gin.Context) {
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
func (h *Handler) GetDetailBooking(c *gin.Context) {
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

func (h *Handler) CreateBooking(c *gin.Context) {
	var booking models.Booking
	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(context.Background(), `
		INSERT INTO bookings (room_id, user_id, start_date, end_date, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id`,
		booking.RoomID, booking.UserID, booking.StartDate, booking.EndDate).Scan(&booking.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "booking_id": booking.ID})
}
// func (h *Handler) UpdateBookingStatus(c *gin.Context) {
// 	id := c.Param("id")
// 	var booking models.Booking

// 	if err := c.ShouldBindJSON(&booking); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	result, err := h.DB.Exec(context.Background(), `
// 		UPDATE bookings 
// 		SET status = $1 
// 		WHERE id = $2`, booking.Status, id)

// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	if result.RowsAffected() == 0 {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "Booking updated successfully"})
// }
func (h *Handler) DeleteBooking(c *gin.Context) {
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
		SELECT p.id, p.booking_id, p.amount, p.method, p.status, p.created_at,
		b.id, b.user_id, u.email, b.room_id, rm.room_number, b.start_date, b.end_date, b.status
		FROM payments p
		INNER JOIN bookings b ON p.booking_id = b.id
		INNER JOIN rooms rm ON b.room_id = rm.id
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
			&payment.ID, &payment.BookingID, &payment.Amount, &payment.Method, &payment.Status, &payment.CreatedAt,
			&booking.ID, &booking.UserID, &booking.UserEmail, &booking.RoomID, &booking.RoomNumber,
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
	err = tx.QueryRow(context.Background(), "SELECT booking_id FROM payments WHERE id = $1", id).Scan(&bookingID)
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
		// Payment accepted → Confirm booking, mark room as booked
		_, err = tx.Exec(context.Background(), "UPDATE bookings SET status = 'confirmed' WHERE id = $1", bookingID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		_, err = tx.Exec(context.Background(), "UPDATE rooms SET status = 'booked' WHERE id = $1", roomID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

	case "canceled":
		// Payment canceled → Cancel booking, keep room available
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




