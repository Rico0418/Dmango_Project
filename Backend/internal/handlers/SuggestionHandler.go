package handlers

import (
	"context"
	"dmangoapp/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)
type SuggestionHandler struct {
	DB *pgxpool.Pool
}
func (h *SuggestionHandler) GetAllSuggestion(c *gin.Context) {
	query := "SELECT s.id, s.description, s.created_at FROM suggestion s"
	var rows pgx.Rows
	var err error

	rows, err = h.DB.Query(context.Background(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		return
	}
	defer rows.Close()
	var suggestions []models.Suggestion
	for rows.Next() {
		var suggestion models.Suggestion
		if err := rows.Scan(&suggestion.ID, &suggestion.Description, &suggestion.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		suggestions = append(suggestions, suggestion)
	}
	c.JSON(http.StatusOK, suggestions)
}
func (h *SuggestionHandler) CreateSuggestion(c *gin.Context) {
	var suggestion models.Suggestion

	if err := c.ShouldBindJSON(&suggestion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.QueryRow(context.Background(), `
		INSERT INTO suggestion (description, created_at)
		VALUES ($1, NOW())
		RETURNING id`, 
		suggestion.Description).Scan(&suggestion.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Suggestion created successfully", "complaint_id": suggestion.ID})
}
func (h *SuggestionHandler) DeleteSuggestion(c *gin.Context) {
	id := c.Param("id")

	result, err := h.DB.Exec(context.Background(), `DELETE FROM suggestion WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Suggestion not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Suggestion deleted successfully"})
}