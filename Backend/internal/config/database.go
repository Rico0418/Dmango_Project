package config

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)
var DB *pgxpool.Pool
func ConnectDB(){
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	databaseUrl := os.Getenv("DATABASE_URL")
	if databaseUrl == "" {
		log.Fatal("No database url in .env file")
	}
	dbpool, err := pgxpool.New(context.Background(),databaseUrl)
	if err != nil {
		log.Fatal("Unable to connect to dtabase: ",err)
	}
	DB = dbpool
	fmt.Println("Connected to database")
}
func CloseDB() {
	if DB != nil {
		DB.Close()
		fmt.Println("Database connection closed")
	}
}