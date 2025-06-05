package utils

import (
	"restaurant_manager/src/application/infrastructure/ports"
	"restaurant_manager/src/config"
)

// InitLocalstackS3 returns an S3 manager configured for LocalStack
func InitLocalstackS3() ports.AwsS3Manager {
	cfg := &config.Properties{}
	cfg.RestaurantManager.Aws.Region = "us-east-1"
	cfg.RestaurantManager.Aws.Profile = "test" // LocalStack accepts any credentials
	// You may need to add an Endpoint field to your config and S3 init logic if not present
	return ports.InitS3(cfg)
}
