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
	r.POST("/register", h.Register)
	r.POST("/login",h.Login)
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/guest_houses",h.GetAllGuestHouses)
		protected.GET("/guest_houses/:id", h.GetDetailGuestHouses)

		protected.GET("/rooms",h.GetAllRooms)
		protected.GET("/rooms/:id",h.GetDetailRoom)
		protected.PUT("/rooms/:id",h.UpdateRoomPrice)

		protected.GET("/users/detail/:id",h.GetDetailUser)
		protected.PUT("/users/password", h.UpdatePassword)

		protected.GET("/complaints",h.GetAllComplaints)
		protected.GET("/complaints/:id",h.GetDetailComplaint)
		protected.POST("/complaints",h.CreateComplaint)
		protected.PUT("/complaints/status/:id",h.UpdateComplaintStatus)
		protected.PUT("/complaints/description/:id",h.UpdateComplaintDescription)
		protected.DELETE("/complaints/:id",h.DeleteComplaint)

		protected.GET("/bookings",h.GetAllBookings)
		protected.GET("/bookings/:id", h.GetDetailBooking)
		protected.POST("/bookings", h.CreateBooking)
		protected.DELETE("/bookings/:id", h.DeleteBooking)

		protected.GET("/payments",h.GetAllPayments)
		protected.GET("/payments/:id",h.GetPaymentDetail)
		protected.POST("/payments",h.CreatePayment)
		protected.DELETE("/payments/:id",h.DeletePayment)
		protected.PATCH("/payments/:id",h.UpdatePaymentStatus)
	}
	r.Run(":8080")
}