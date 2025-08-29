package config

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

type Properties struct {
	RestaurantManager struct {
		Database string    `yaml:"database"`
		JWT      jwtConfig `yaml:"jwt"`
		Aws      awsCreds  `yaml:"aws"`
	} `yaml:"restaurant_manager"`
}

type jwtConfig struct {
	PrivateKeyPath string `yaml:"private_key_path"`
	PublicKeyPath  string `yaml:"public_key_path"`
}

type awsCreds struct {
	Profile string `yaml:"profile"`
	Region  string `yaml:"region"`
}

func LoadConfig() *Properties {
	err := godotenv.Load()
	if err != nil {
		log.Error().Msg("Error loading .env file " + err.Error())
	}

	env := os.Getenv("APP_ENV")
	log.Info().Msg("APP_ENV: " + env)
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
	log.Info().Msg("data: " + string(data))
	if err != nil {
		log.Err(err)
		log.Error().Stack().Msg("Error open file")
	}

	// Replace environment variables in the YAML content
	content := string(data)
	content = substituteEnvVars(content)

	var baseConfig Properties
	err = yaml.Unmarshal([]byte(content), &baseConfig)

	if err != nil {
		log.Error().Msg("❌ Config for environment not found in YAML")
	}
	return &baseConfig
}

func substituteEnvVars(content string) string {
	// Replace ${ENV_VAR} patterns with actual environment variable values
	for {
		start := strings.Index(content, "${")
		if start == -1 {
			break
		}
		end := strings.Index(content[start:], "}")
		if end == -1 {
			break
		}
		end = start + end

		envVar := content[start+2 : end]
		envValue := os.Getenv(envVar)

		// If environment variable is not set, keep the original placeholder
		if envValue == "" {
			content = content[:start] + content[end+1:]
		} else {
			content = content[:start] + envValue + content[end+1:]
		}
	}
	return content
}
