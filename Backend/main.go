package main
import(
	"dmangoapp/config"
	"dmangoapp/handlers"
	"dmangoapp/middleware"
	"github.com/gin-gonic/gin"
)
func main(){
	config.ConnectDB()
	defer config.DB.Close()
	h := &handlers.Handler{DB: config.DB}
	Uh := &handlers.UserHandler{DB: config.DB}
	Rh := &handlers.RoomHandler{DB: config.DB}
	Ch := &handlers.ComplaintsHandler{DB: config.DB}
	Bh := &handlers.BookingHandler{DB: config.DB}
	Gh := &handlers.GuestHouseHandler{DB: config.DB}
	r := gin.Default()
	r.Use(func (c *gin.Context)  {
		c.Writer.Header().Set("Access-Control-Allow-Origin","*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-Frame-Options","DENY")
		c.Writer.Header().Set("X-XSS-Protection","1; mode+block")
		c.Writer.Header().Set("Referrer-Policy","strict-origin-when-cross-origin")
		c.Writer.Header().Set("Permissions-Policy", "geolocation=(), microphone-(), camera=()")
		c.Writer.Header().Set("Content-Security-Policy", "default-src 'self'; object-src 'none'")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	r.POST("/register", Uh.Register)
	r.POST("/login",Uh.Login)
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{

		protected.GET("/guest_houses",Gh.GetAllGuestHouses)
		protected.GET("/guest_houses/:id", Gh.GetDetailGuestHouses)

		protected.GET("/rooms",Rh.GetAllRooms)
		protected.GET("/rooms/:id",Rh.GetDetailRoom)
		protected.PUT("/rooms/:id",Rh.UpdateRoomPrice)
		protected.PUT("/rooms/update-status", Rh.UpdateRoomStatus)
		protected.PUT("/rooms/update-booked", Rh.MarkRoomAsBookedToday)
		protected.PUT("/rooms/update-price", Rh.UpdateRoomPriceByType)

		protected.GET("/users/detail/:id",Uh.GetDetailUser)
		protected.GET("/users",Uh.GetAllUser)
		protected.PUT("/users/password", Uh.UpdatePassword)

		protected.GET("/complaints",Ch.GetAllComplaints)
		protected.GET("/complaints/user/:user_id",Ch.GetComplaintByUserID)
		protected.POST("/complaints",Ch.CreateComplaint)
		protected.PUT("/complaints/status/:id",Ch.UpdateComplaintStatus)
		protected.PUT("/complaints/description/:id",Ch.UpdateComplaintDescription)
		protected.DELETE("/complaints/:id",Ch.DeleteComplaint)

		protected.GET("/bookings",Bh.GetAllBookings)
		protected.GET("/bookings/:id", Bh.GetDetailBooking)
		protected.GET("/bookings/room/:room_id",Bh.GetDetailBookingDate)
		protected.POST("/bookings", Bh.CreateBooking)
		protected.DELETE("/bookings/:id", Bh.DeleteBooking)

		protected.GET("/payments",h.GetAllPayments)
		protected.GET("/payments/user/:user_id",h.GetPaymentDetailbyUserID)
		protected.POST("/payments",h.CreatePayment)
		protected.DELETE("/payments/:id",h.DeletePayment)
		protected.PATCH("/payments/:id",h.UpdatePaymentStatus)
	}
	r.Run(":8080")
}