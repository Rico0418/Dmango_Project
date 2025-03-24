package handlers

import (
	"context"
	"dmangoapp/models"
	"dmangoapp/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	DB *pgxpool.Pool
}

// handler for models Guest House
func (h *Handler) GetAllGuestHouses(c *gin.Context) {
	rows, err := h.DB.Query(context.Background(), `SELECT * FROM guest_houses`)
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
	err := h.DB.QueryRow(context.Background(), "SELECT id, admin_id,name,location FROM guest_houses WHERE id = $1", id).
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

func (h *Handler) UpdateRoom(c *gin.Context) {
	id := c.Param("id")

	var room models.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(context.Background(), `
		UPDATE rooms 
		SET price_per_day = $1, price_per_month = $2, status = $3 
		WHERE id = $4`, 
		room.PricePerDay, room.PricePerMonth, room.Status, id)

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
		"INSERT INTO users (email, password) VALUES ($1, $2)", user.Email, user.Password)
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
func (h *Handler) UpdatePassword(c *gin.Context) {
	userID := c.GetInt("user_id")

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
		`SELECT r.id, r.room_id, rm.room_number, r.user_id, u.email, r.description, r.status, r.created_at
		FROM complaints r
		INNER JOIN rooms rm ON r.room_id = rm.id
		INNER JOIN users u ON r.user_id = u.id`)
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
	var complaint models.Complaint
	err := h.DB.QueryRow(context.Background(), `
		SELECT r.id, r.room_id, rm.room_number, r.user_id, u.email, r.description, r.status, r.created_at
		FROM complaints r
		INNER JOIN rooms rm ON r.room_id = rm.id
		INNER JOIN users u ON r.user_id = u.id
		WHERE r.id = $1`, id).Scan(
		&complaint.ID, &complaint.RoomID, &complaint.RoomNumber, &complaint.UserID, &complaint.UserEmail,
		&complaint.Description, &complaint.Status, &complaint.CreatedAt,
	)
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

