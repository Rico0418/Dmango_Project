package middleware

import (
	"net/http"
	"strconv"
	"strings"

	"dmangoapp/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
			c.Abort()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(tokenParts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Handle user_id as int or string
		var userID int
		switch v := claims["user_id"].(type) {
		case float64: // JWT often encodes numbers as float64
			userID = int(v)
		case int:
			userID = v
		case string:
			userID, err = strconv.Atoi(v)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
				c.Abort()
				return
			}
		default:
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token payload"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Set("role", claims["role"]) // Assuming role is stored in claims
		c.Next()
	}
}

