package utils

import (
	"context"
	"fmt"
	"path/filepath"
	"testing"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/go-connections/nat"
	"github.com/rs/zerolog/log"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/localstack"
	"github.com/testcontainers/testcontainers-go/wait"
)

func PostgresContainer() (testcontainers.Container, string, error) {
	ctx := context.Background()
	req := testcontainers.ContainerRequest{
		Image: "postgres:17.0",
		Env: map[string]string{
			"POSTGRES_PASSWORD": "postgres",
			"POSTGRES_USER":     "postgres",
			"POSTGRES_DB":       "servu",
		},
		HostConfigModifier: func(hc *container.HostConfig) {
			hc.PortBindings = nat.PortMap{"5432/tcp": []nat.PortBinding{
				{
					HostIP:   "127.0.0.1",
					HostPort: "5434",
				},
			}}
		},
		ExposedPorts: []string{"5432/tcp"},
		WaitingFor:   wait.ForExposedPort(),
	}
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	err = container.Start(ctx)
	if err != nil {
		return container, "", err
	}
	ip, _ := container.ContainerIP(ctx)
	return container, ip, nil
}

func FlyWayContainer(ip string) (testcontainers.Container, error) {
	connStr := fmt.Sprintf("jdbc:postgresql://%s:5432/servu", ip)
	ctx := context.Background()
	absPath, err := filepath.Abs(filepath.Join("../../..", "db_versioning"))
	bindContainer := fmt.Sprintf("%s:/flyway/sql", absPath)
	req := testcontainers.ContainerRequest{
		Image: "flyway/flyway:latest",
		Env: map[string]string{
			"FLYWAY_USER":     "postgres",
			"FLYWAY_PASSWORD": "postgres",
			"FLYWAY_URL":      connStr,
			"FLYWAY_SCHEMAS":  "servu",
			"FLYWAY_GROUP":    "true",
		},
		Cmd: []string{
			"-locations=filesystem:/flyway/sql",
			"-connectRetries=60",
			"migrate",
		},
		HostConfigModifier: func(hc *container.HostConfig) {
			hc.Binds = []string{bindContainer}
		},
		WaitingFor: wait.ForExec([]string{
			"-locations=filesystem:/flyway/sql",
			"-connectRetries=60",
			"migrate",
		}),
	}
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})

	err = container.Start(ctx)
	if err != nil {
		return nil, err
	}
	return container, nil
}

func LocalstackContainer() (testcontainers.Container, error) {
	ctx := context.Background()
	localstackContainer, err := localstack.Run(ctx, "localstack/localstack:latest",
		testcontainers.WithEnv(map[string]string{"SERVICES": "s3,sqs"}),
		testcontainers.WithExposedPorts("4567/tcp"),
	)

	if err != nil {
		log.Error().Msgf("Failed to run localstack container: %v", err)
	}
	return localstackContainer, nil
}

func SetUp(t *testing.T) (testcontainers.Container, testcontainers.Container, testcontainers.Container) {
	postgresContainer, postgresIp, _ := PostgresContainer()
	flyContainer, _ := FlyWayContainer(postgresIp)
	localstackContainer, _ := LocalstackContainer()

	return postgresContainer, flyContainer, localstackContainer
}
func CleanUp(container []testcontainers.Container) {
	ctx := context.Background()
	for _, c := range container {
		if c != nil {
			c.Terminate(ctx)
		}
	}

}
