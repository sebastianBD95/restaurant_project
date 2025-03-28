package config

import (
	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
	"os"
	"path/filepath"
)

type Properties struct {
	RestaurantManager struct {
		Database string `yaml:"database"`
	} `yaml:"restaurant_manager"`
}

func LoadConfig() *Properties {
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "dev"
	}

	filePath := "resources/restaurant_manager." + env + ".yaml"
	absPath, err := filepath.Abs(filePath)
	log.Info().Msg(absPath)
	data, err := os.ReadFile(absPath)
	if err != nil {
		log.Err(err)
		log.Error().Stack().Msg("Error open file")
	}
	var baseConfig Properties
	err = yaml.Unmarshal(data, &baseConfig)

	if err != nil {
		log.Error().Msg("❌ Config for environment not found in YAML")
	}
	return &baseConfig
}
