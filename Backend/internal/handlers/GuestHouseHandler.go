package handlers

import (
	"context"
	"dmangoapp/internal/models"
	"net/http"


	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GuestHouseHandler struct {
	DB *pgxpool.Pool
}

// handler for models Guest House
func (h *GuestHouseHandler) GetAllGuestHouses(c *gin.Context) {
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
func (h *GuestHouseHandler) GetDetailGuestHouses(c *gin.Context) {
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
