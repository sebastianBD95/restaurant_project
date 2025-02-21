package config

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var DB *sqlx.DB

func ConnectDB(cfg *Properties) {
	var err error
	DB, err = sqlx.Connect("postgres", cfg.RestaurantManager.Database)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	fmt.Println("✅ Connected to PostgreSQL")
}
