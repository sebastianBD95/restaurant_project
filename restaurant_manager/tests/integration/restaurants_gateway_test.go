package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/tests/integration/utils"
	"testing"

	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
)

func TestAddRestaurant(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Login to get token
	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	writer.WriteField("name", "Test Restaurant")
	writer.WriteField("description", "Test Description")
	imageField, err := writer.CreateFormFile("image", "cafe.jpeg")
	if err != nil {
		t.Fatal(err)
	}

	// Open the actual JPEG file
	f, err := os.Open("./resources/cafe.jpg")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()

	// Copy the file bytes to the multipart writer
	if _, err := io.Copy(imageField, f); err != nil {
		t.Fatal(err)
	}
	writer.Close()

	req, _ := http.NewRequest("POST", "/restaurants", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+token)

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["restaurant_id"])
}

func TestDeleteRestaurant(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Login to get token
	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	constStr := fmt.Sprintf("/restaurants/%s", restaurantID)

	req, _ := http.NewRequest("DELETE", constStr, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusNoContent, response.Code)

}

func TestGetRestaurant(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, description, owner_id, image_url)
		VALUES ('Test Restaurant', 'Test Description', ?, 'https://test.com') 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Login to get token
	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	req, _ := http.NewRequest("GET", "/restaurants", nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)
	var responseBody []models.Restaurant
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.Equal(t, "Test Restaurant", responseBody[0].Name)
	assert.Equal(t, "Test Description", responseBody[0].Description)
	assert.Equal(t, "https://test.com", responseBody[0].ImageURL)
	assert.Equal(t, userID, responseBody[0].OwnerID)
}

func TestUpdateRestaurant(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Login to get token
	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	constStr := fmt.Sprintf("/restaurants/%s", restaurantID)
	restaurantData := map[string]string{
		"name":     "Test Restaurant_2",
		"owner_id": userID,
		"address":  "123 Main St",
	}
	restaurantJSON, _ := json.Marshal(restaurantData)

	req, _ := http.NewRequest("PUT", constStr, bytes.NewBuffer(restaurantJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

}
