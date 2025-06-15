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

func TestAddMenu(t *testing.T) {
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

	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	// Create form data for menu item
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("name", "Burger")
	writer.WriteField("description", "Juicy beef burger")
	writer.WriteField("price", "10.99")
	writer.WriteField("category", "Main")
	writer.WriteField("available", "true")

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

	// Create request with the correct path
	req, _ := http.NewRequest("POST", fmt.Sprintf("/menus/%s/items", restaurantID), body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["menu_item_id"])
}

func TestDeleteMenu(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID, menuItemID string

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

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://www.google.com') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Use the correct endpoint for deleting a menu item
	connStr := fmt.Sprintf("/menus/%s/items/%s", restaurantID, menuItemID)
	req, _ := http.NewRequest("DELETE", connStr, nil)
	req.Header.Set("Content-Type", "application/json")

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusNoContent, response.Code)

}

func TestAddMenuItemWithIngredients(t *testing.T) {
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

	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	// Create form data for menu item
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("name", "Burger")
	writer.WriteField("description", "Juicy beef burger")
	writer.WriteField("price", "10.99")
	writer.WriteField("category", "Main")
	writer.WriteField("available", "true")

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

	// Add ingredients
	writer.WriteField("ingredients[0][raw_ingredient_id]", "107")
	writer.WriteField("ingredients[0][quantity]", "250")
	writer.WriteField("ingredients[0][unit]", "g")
	writer.WriteField("ingredients[0][price]", "100000")
	writer.WriteField("ingredients[1][raw_ingredient_id]", "2")
	writer.WriteField("ingredients[1][quantity]", "100")
	writer.WriteField("ingredients[1][unit]", "g")
	writer.WriteField("ingredients[1][price]", "100000")

	writer.Close()

	// Create request with the correct path
	req, _ := http.NewRequest("POST", fmt.Sprintf("/menus/%s/items", restaurantID), body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["menu_item_id"])

	// Get menu item
	connStr := fmt.Sprintf("/menus/%s/items", restaurantID)
	req, _ = http.NewRequest("GET", connStr, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	response = fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var items []models.MenuItem
	json.Unmarshal(response.Body.Bytes(), &items)

	// check ingredients
	assert.Equal(t, 2, len(items[0].Ingredients))
	assert.Equal(t, "107", items[0].Ingredients[0].IngredientID)
	assert.Equal(t, "2", items[0].Ingredients[1].IngredientID)
}

func TestUpdateMenuItem(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	token := utils.LoginAndGetToken(t, fixture.Router, "alice@admin.com", "admin123")

	restaurantID := "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1"
	menuItemID := "ccccccc1-cccc-cccc-cccc-ccccccccccc1"

	menuItem := models.MenuItem{
		MenuItemID:   menuItemID,
		Name:         "Bife a la Criolla",
		Description:  "Bife a la criolla con papas fritas y ensalada",
		Price:        50000,
		Available:    true,
		RestaurantID: restaurantID,
		Ingredients: []models.Ingredient{
			{
				IngredientID:    "dddddddd-dddd-dddd-dddd-dddddddd0001",
				Amount:          250,
				Unit:            "g",
				Price:           100000,
				RawIngredientID: "107",
			},
		},
		SideDishes: 3,
		Category:   "Main",
		ImageURL:   "https://servu-web.s3.us-east-1.amazonaws.com/TestMock/menu/bife.jpg",
	}

	menuItemJSON, _ := json.Marshal(menuItem)

	req, _ := http.NewRequest("PUT", fmt.Sprintf("/menus/%s/items/%s", restaurantID, menuItemID), bytes.NewBuffer(menuItemJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	// Get menu item
	connStr := fmt.Sprintf("/menus/%s/items", restaurantID)
	req, _ = http.NewRequest("GET", connStr, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	response = fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var items []models.MenuItem
	json.Unmarshal(response.Body.Bytes(), &items)

	for _, item := range items {
		if item.MenuItemID == menuItemID {
			assert.Equal(t, menuItem.Name, item.Name)
			assert.Equal(t, menuItem.Description, item.Description)
			assert.Equal(t, menuItem.Price, item.Price)
			assert.Equal(t, menuItem.Available, item.Available)
			assert.Equal(t, menuItem.SideDishes, item.SideDishes)
			assert.Equal(t, menuItem.Category, item.Category)
			assert.Equal(t, menuItem.ImageURL, item.ImageURL)
			assert.Equal(t, menuItem.Ingredients[0].Amount, item.Ingredients[0].Amount)
			assert.Equal(t, menuItem.Ingredients[0].Unit, item.Ingredients[0].Unit)
			assert.Equal(t, menuItem.Ingredients[0].Price, item.Ingredients[0].Price)
			break
		}
	}

}
