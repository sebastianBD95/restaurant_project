package config

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

var DB *gorm.DB

func ConnectDB(cfg *Properties) {
	var err error
	DB, err = gorm.Open(postgres.Open(cfg.RestaurantManager.Database), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix: "servu.",
		},
	})
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	fmt.Println("✅ Connected to PostgreSQL")
}
