package handlers
import (
	"context"
	"dmangoapp/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomHandler struct {
	DB *pgxpool.Pool
}
func (h *RoomHandler) GetAllRooms(c *gin.Context) {
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

func (h *RoomHandler) GetDetailRoom(c *gin.Context) {
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

func (h *RoomHandler) UpdateRoomPrice(c *gin.Context) {
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

func (h *RoomHandler) UpdateRoomStatus( c *gin.Context){
	fmt.Println(">> Entered UpdateRoomStatus handler")
	result,err := h.DB.Exec(context.Background(),
         `UPDATE rooms
		 SET status = 'available'
		 WHERE id IN(
		    SELECT room_id 
			FROM bookings 
			GROUP BY room_id
    		HAVING MAX(end_date)::date < CURRENT_DATE
		) AND status != 'available'`)
	if err != nil {
		fmt.Println("SQL Error:", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if result.RowsAffected() == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No rooms status updated"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Room status updated successfully"})	
}

func (h *RoomHandler) MarkRoomAsBookedToday(c *gin.Context){
	result, err := h.DB.Exec(context.Background(),`
		UPDATE rooms
		SET status = 'booked'
		WHERE id IN (
			SELECT room_id
			FROM bookings
			WHERE start_date = CURRENT_DATE AND status = 'confirmed'
		)
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if result.RowsAffected() == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No rooms status updated"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Rooms booked for today's check-ins"})
}

func (h * RoomHandler) UpdateRoomPriceByType(c *gin.Context) {
	var req struct {
		Type string `json:"type"`
		Price float64 `json:"price"`
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
		query = `UPDATE rooms SET price_per_day = $1 WHERE type = 'daily'`
	}else{
		query = `UPDATE rooms SET price_per_month = $1 WHERE type = 'monthly'`
	}
	result, err := h.DB.Exec(context.Background(), query, req.Price)
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