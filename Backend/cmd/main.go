package main

import (
	"dmangoapp/internal/config"
	"dmangoapp/internal/handlers"
	"dmangoapp/internal/middleware"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/robfig/cron"
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
	S  := &handlers.SuggestionHandler{DB: config.DB}
	Re := &handlers.ReviewHandler{DB: config.DB}
	r := gin.Default()

	loc, err := time.LoadLocation("Asia/Jakarta")
	if(err != nil) {
		panic(err)
	}

	cronJob := cron.NewWithLocation(loc)
	cronJob.AddFunc("0 */6 * * *", func(){
		if err := Rh.UpdateRoomStatus(); err != nil {
			println("Failed to update available rooms: ", err.Error())
		}
		if err := Rh.MarkRoomAsBookedToday(); err != nil {
			println("Failed to mark booked rooms: ", err.Error())
		}
	})

	cronJob.Start()
	defer cronJob.Stop()
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
		protected.GET("/payments/admin/report", h.DownloadPaymentByMonth)
		protected.POST("/payments",h.CreatePayment)
		protected.DELETE("/payments/:id",h.DeletePayment)
		protected.PATCH("/payments/:id",h.UpdatePaymentStatus)
		protected.PATCH("/payments-method/:id",h.UpdatePaymentMethod)

		protected.GET("/suggestion", S.GetAllSuggestion)
		protected.POST("/suggestion", S.CreateSuggestion)
		protected.DELETE("/suggestion/:id",S.DeleteSuggestion)

		protected.GET("/reviews", Re.GetAllReviews)
		protected.POST("/reviews", Re.CreateReview)
		protected.PUT("/reviews/:id", Re.UpdateReview)
		protected.DELETE("/reviews/:id", Re.DeleteReview)
	}
	r.Run(":8081")
}