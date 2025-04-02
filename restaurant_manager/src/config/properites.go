package config

import (
	"os"
	"path/filepath"

	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
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

	resourcePath := "resources/restaurant_manager." + env + ".yaml"
	absPath, err := filepath.Abs(resourcePath)
	if err != nil {
		log.Err(err)
		log.Error().Stack().Msg("Error open file")
	}
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
