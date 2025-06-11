package integration

import (
	"restaurant_manager/tests/integration/utils"
	"testing"

	"github.com/gorilla/mux"
	"github.com/testcontainers/testcontainers-go"
)

type TestFixture struct {
	PostgresContainer   testcontainers.Container
	FlywayContainer     testcontainers.Container
	LocalstackContainer testcontainers.Container
	Router              *mux.Router
	Mock                *utils.MockImpl
}

func NewTestFixture(t *testing.T) *TestFixture {
	postgresContainer, flyContainer, localstackContainer := utils.SetUp(t)
	mock := utils.NewMock(t)
	router := mock.SetRoutes(localstackContainer)
	return &TestFixture{
		PostgresContainer:   postgresContainer,
		FlywayContainer:     flyContainer,
		LocalstackContainer: localstackContainer,
		Router:              router,
		Mock:                mock,
	}
}

// Optionally, add a cleanup method
func (f *TestFixture) TearDown() {
	utils.CleanUp([]testcontainers.Container{f.PostgresContainer, f.FlywayContainer, f.LocalstackContainer})
}
