package models

import "time"

type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
	Role     string `json:"role"` // "customer" or "admin"
}
type GuestHouse struct {
	ID       int    `json:"id"`
	AdminID  int    `json:"admin_id"`
	Name     string `json:"name"`
	Location string `json:"location"`
}
type Room struct {
	ID            int      `json:"id"`
	GuestHouseID  int      `json:"guest_house_id"`
	RoomNumber    string   `json:"room_number"`
	Type          string   `json:"type"` // "daily" or "monthly"
	PricePerDay   *float64 `json:"price_per_day,omitempty"`
	PricePerMonth *float64 `json:"price_per_month,omitempty"`
	Status        string   `json:"status"` // "available" or "booked"
}
type Review struct {
	ID        int       `json:"id"`
	RoomID    int       `json:"room_id"`
	UserID    int       `json:"user_id"`
	Rating    int       `json:"rating"`
	Comment   *string   `json:"comment,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
type Complaint struct {
	ID          int       `json:"id"`
	RoomID      int       `json:"room_id"`
	UserID      int       `json:"user_id"`
	Description string    `json:"description"`
	Status      string    `json:"status"` // "pending", "resolved"
	CreatedAt   time.Time `json:"created_at"`
}
type Booking struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	RoomID    int       `json:"room_id"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	Status    string    `json:"status"` // "pending", "confirmed", "canceled"
}
type Payment struct {
	ID        int       `json:"id"`
	BookingID int       `json:"booking_id"`
	Amount    float64   `json:"amount"`
	Method    string    `json:"method"` // "credit_card", "paypal", "cash"
	Status    string    `json:"status"` // "pending", "completed", "failed"
	CreatedAt time.Time `json:"created_at"`
}