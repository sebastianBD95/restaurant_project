package utils

import (
	"context"
	"fmt"
	"restaurant_manager/src/application/infrastructure/ports"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/rs/zerolog/log"
	"github.com/testcontainers/testcontainers-go"
)

func InitLocalstackS3(localstackContainer testcontainers.Container) ports.AwsS3Manager {
	ctx := context.Background()

	port, err := localstackContainer.MappedPort(ctx, "4566/tcp")
	if err != nil {
		log.Error().Msgf("Failed to get mapped port: %v", err)
	}

	sess, _ := session.NewSession(&aws.Config{
		Region:           aws.String("us-east-1"),
		Endpoint:         aws.String(fmt.Sprintf("http://localhost:%s", port.Port())),
		S3ForcePathStyle: aws.Bool(true),
		Credentials:      credentials.NewStaticCredentials("test", "test", ""),
	})

	s3Client := s3.New(sess)

	// Create the bucket
	bucketName := "servu-web"
	_, err = s3Client.CreateBucket(&s3.CreateBucketInput{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		log.Error().Msgf("Failed to create bucket: %v", err)
	}
	return ports.NewAwsS3ManagerWithClient(s3Client)
}
