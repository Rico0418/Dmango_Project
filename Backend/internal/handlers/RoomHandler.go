package handlers

import (
	"context"
	"dmangoapp/internal/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomHandler struct {
	DB *pgxpool.Pool
}
func (h *RoomHandler) GetAllRooms(c *gin.Context) {
	guestHouseID := c.Query("guest_house_id")
	query := "SELECT rm.id, rm.guest_house_id, gh.name, rm.room_number, rm.type, rm.price_per_day, rm.price_per_month, rm.facilities, rm.status FROM rooms rm INNER JOIN guest_house gh ON rm.guest_house_id = gh.id"
	var rows pgx.Rows
	var err error

	if guestHouseID != "" {
		query += " WHERE rm.guest_house_id = $1"
		rows, err = h.DB.Query(context.Background(),query,guestHouseID)
	}else{
		rows, err = h.DB.Query(context.Background(), query)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		return
	}
	defer rows.Close()
	var rooms []models.Room
	for rows.Next() {
		var room models.Room
		if err := rows.Scan(&room.ID, &room.GuestHouseID, &room.GuestHouseName, &room.RoomNumber, &room.Type, &room.PricePerDay, &room.PricePerMonth, &room.Facilities, &room.Status); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		rooms = append(rooms, room)
	}
	c.JSON(http.StatusOK, rooms)
}

func (h *RoomHandler) GetDetailRoom(c *gin.Context) {
	id := c.Param("id")
	roomNumber := c.Query("room_number")

	var room models.Room
	var err error

	if roomNumber != "" {
		err = h.DB.QueryRow(context.Background(), `
			SELECT id, guest_house_id, room_number, type, price_per_day, price_per_month, facilities, status 
			FROM rooms WHERE room_number = $1`, roomNumber).
			Scan(&room.ID, &room.GuestHouseID, &room.RoomNumber, &room.Type, &room.PricePerDay, &room.PricePerMonth, &room.Facilities, &room.Status)
	} else {
		err = h.DB.QueryRow(context.Background(), `
			SELECT id, guest_house_id, room_number, type, price_per_day, price_per_month, facilities, status 
			FROM rooms WHERE id = $1`, id).
			Scan(&room.ID, &room.GuestHouseID, &room.RoomNumber, &room.Type, &room.PricePerDay, &room.PricePerMonth,&room.Facilities, &room.Status)
	}

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	c.JSON(http.StatusOK, room)
}

func (h *RoomHandler) UpdateRoomPrice(c *gin.Context) {
	id := c.Param("id")

	var room models.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(context.Background(), `
		UPDATE rooms 
		SET price_per_day = $1, price_per_month = $2, facilities = $3
		WHERE id = $4`, 
		room.PricePerDay, room.PricePerMonth, room.Facilities, id)

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

func (h *RoomHandler) UpdateRoomStatus() error{
	fmt.Println(">> Entered UpdateRoomStatus handler")
	_,err := h.DB.Exec(context.Background(),
         `UPDATE rooms
		 SET status = 'available'
		 WHERE id IN(
		    SELECT room_id 
			FROM bookings 
			GROUP BY room_id
    		HAVING MAX(end_date)::date < CURRENT_DATE
		) AND status != 'available'`)
	return err
}

func (h *RoomHandler) MarkRoomAsBookedToday() error {
	_, err := h.DB.Exec(context.Background(),`
		UPDATE rooms
		SET status = 'booked'
		WHERE id IN (
			SELECT room_id
			FROM bookings
			WHERE status = 'confirmed'
			AND CURRENT_DATE >= start_date::date
			AND CURRENT_DATE <= end_date::date
		) AND status != 'booked'
	`)
	return err
}

func (h * RoomHandler) UpdateRoomPriceByType(c *gin.Context) {
	var req struct {
		Type string `json:"type"`
		Price float64 `json:"price"`
		GuestHouseID int `json:"guest_house_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Type != "daily" && req.Type != "monthly" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Type must be 'daily' or 'monthly' "})
		return
	}
	var query string
	if req.Type == "daily" {
		query = `UPDATE rooms SET price_per_day = $1 WHERE type = 'daily' and guest_house_id = $2`
	}else{
		query = `UPDATE rooms SET price_per_month = $1 WHERE type = 'monthly' and guest_house_id = $2`
	}
	result, err := h.DB.Exec(context.Background(), query, req.Price, req.GuestHouseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No rooms of this type found to update"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Room prices updated successfully"})
}