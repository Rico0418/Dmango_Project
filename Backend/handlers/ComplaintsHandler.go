package handlers

import (
	"context"
	"dmangoapp/models"
	"net/http"


	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ComplaintsHandler struct {
	DB *pgxpool.Pool
}
func (h *ComplaintsHandler) GetAllComplaints(c *gin.Context) {
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
func (h *ComplaintsHandler) GetComplaintByUserID(c *gin.Context) {
	userID := c.Param("user_id")
	
	query := `
		SELECT c.id, c.room_id, rm.room_number, c.user_id, u.email, c.description, c.status, c.created_at
		FROM complaints c
		INNER JOIN rooms rm ON c.room_id = rm.id
		INNER JOIN users u ON c.user_id = u.id
		WHERE c.user_id = $1
		ORDER BY c.created_at DESC
	`
	rows, err := h.DB.Query(context.Background(),query,userID)
	
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "failed to fetch complaints"})
		return
	}
	defer rows.Close()
	
	var complaints []models.Complaint
	for rows.Next() {
		var complaint models.Complaint
		err := rows.Scan(
			&complaint.ID, &complaint.RoomID, &complaint.RoomNumber,
			&complaint.UserID, &complaint.UserEmail, &complaint.Description,
			&complaint.Status, &complaint.CreatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning data"})
			return
		}
		complaints = append(complaints, complaint)
	}
	c.JSON(http.StatusOK, complaints)
}
func (h *ComplaintsHandler) GetDetailComplaint(c *gin.Context) {
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
func (h *ComplaintsHandler) CreateComplaint(c *gin.Context) {
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

func (h *ComplaintsHandler) UpdateComplaintStatus(c *gin.Context) {
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
func (h *ComplaintsHandler) UpdateComplaintDescription(c *gin.Context) {
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

func (h *ComplaintsHandler) DeleteComplaint(c *gin.Context) {
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