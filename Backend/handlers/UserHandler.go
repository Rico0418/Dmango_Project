package handlers

import (
	"context"
	"dmangoapp/models"
	"dmangoapp/utils"
	"fmt"
	"net/http"


	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserHandler struct {
	DB *pgxpool.Pool
}
func (h *UserHandler) Register(c *gin.Context) {
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
		"INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", user.Name,user.Email, user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func (h *UserHandler) Login(c *gin.Context) {
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
func (h *UserHandler) GetDetailUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	err := h.DB.QueryRow(context.Background(), "SELECT id,name,email,password FROM users WHERE id = $1", id).
		Scan(&user.ID, &user.Name, &user.Email, &user.Password)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
	})
}
func (h *UserHandler) UpdatePassword(c *gin.Context) {
	userID := c.GetInt("user_id")
	fmt.Println("User ID from token:", userID)

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