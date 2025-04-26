package ports

import (
	"fmt"
	"mime/multipart"
	"restaurant_manager/src/config"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/rs/zerolog/log"
)

type AwsS3Manager struct {
	s3Manager *s3.S3
}

func InitS3(cfg *config.Properties) AwsS3Manager {

	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(cfg.RestaurantManager.Aws.Region),
		Credentials: credentials.NewSharedCredentials("", cfg.RestaurantManager.Aws.Profile),
	})
	if err != nil {
		log.Error().Msgf("Failed to create AWS session: %v", err)
	}
	awsS3Manager := s3.New(sess)

	return AwsS3Manager{
		s3Manager: awsS3Manager,
	}
}

func (as3 *AwsS3Manager) UploadImage(folder string, subfolder string, bucketName string, file multipart.File) (string, error) {
	fileName := fmt.Sprintf("%s/%s/%s", folder, subfolder, generateUniqueFileName())

	uploadParams := &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(fileName),
		Body:        file,
		ContentType: aws.String("image/jpeg"),
	}

	_, err := as3.s3Manager.PutObject(uploadParams)
	if err != nil {
		return "", fmt.Errorf("failed to upload image to S3, %v", err)
	}

	imageURL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", bucketName, fileName)
	return imageURL, nil
}

func generateUniqueFileName() string {
	return fmt.Sprintf("%s.jpg", strings.ReplaceAll(fmt.Sprintf("%d", time.Now().UnixNano()), "-", ""))
}
