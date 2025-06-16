package models

import "time"

type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"password,omitempty"`
	Role      string    `json:"role"` // "customer" or "admin"
	CreatedAt time.Time `json:"created_at"`
}
type GuestHouse struct {
	ID       int    `json:"id"`
	AdminID  int    `json:"admin_id"`
	Name     string `json:"name"`
	Location string `json:"location"`
}
type Room struct {
	ID             int       `json:"id"`
	GuestHouseID   int       `json:"guest_house_id"`
	GuestHouseName string    `json:"guest_house_name"`
	RoomNumber     string    `json:"room_number"`
	Type           string    `json:"type"` // "daily" or "monthly"
	PricePerDay    *float64  `json:"price_per_day"`
	PricePerMonth  *float64  `json:"price_per_month"`
	Facilities     *[]string `json:"facilities"`
	Status         string    `json:"status"` // "available" or "booked"
}
type Complaint struct {
	ID             int       `json:"id"`
	GuestHouseName string    `json:"guest_house_name"`
	RoomID         int       `json:"room_id"`
	RoomNumber     string    `json:"room_number"`
	UserID         int       `json:"user_id"`
	UserEmail      string    `json:"email"`
	Description    string    `json:"description"`
	Status         string    `json:"status"` // "pending", "resolved"
	CreatedAt      time.Time `json:"created_at"`
}
type Booking struct {
	ID             int       `json:"id"`
	GuestHouseName string    `json:"guest_house_name"`
	UserID         int       `json:"user_id"`
	UserName       string    `json:"name"`
	UserEmail      string    `json:"email"`
	RoomID         int       `json:"room_id"`
	RoomNumber     string    `json:"room_number"`
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	Status         string    `json:"status"` // "pending", "confirmed", "canceled"
	CreatedAt      time.Time `json:"created_at"`
}
type BookingRequest struct {
	RoomID    int    `json:"room_id"`
	UserID    int    `json:"user_id"`
	StartDate string `json:"start_date"` // Expecting "YYYY-MM-DD"
	EndDate   string `json:"end_date"`
}
type Payment struct {
	ID             int       `json:"id"`
	GuestHouseName string    `json:"guest_house_name"`
	BookingID      int       `json:"booking_id"`
	Amount         float64   `json:"amount"`
	Method         string    `json:"method"` // "credit_card", "paypal", "cash"
	Status         string    `json:"status"` // "pending", "completed", "failed"
	CreatedAt      time.Time `json:"created_at"`
	Booking        *Booking  `json:"booking,omitempty"`
}
type Suggestion struct {
	ID          int       `json:"id"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}
