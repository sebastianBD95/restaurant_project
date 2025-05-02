package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/interfaces/handlers/dto"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/application/utils"
	"restaurant_manager/src/domain/models"

	"github.com/rs/zerolog/log"
)

type UserHandler struct {
	service *services.UserService
}

func NewUserHandler(service *services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

// writeJSONResponse writes a JSON response with the given status code
func (h *UserHandler) writeJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Error().Err(err).Msg("Failed to encode JSON response")
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// writeErrorResponse writes an error response
func (h *UserHandler) writeErrorResponse(w http.ResponseWriter, status int, message string) {
	h.writeJSONResponse(w, status, map[string]string{"error": message})
}

// RegisterUser handles user registration
func (h *UserHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		log.Error().Err(err).Msg("Failed to decode request body")
		h.writeErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, err := h.service.RegisterUser(&user)
	if err != nil {
		log.Error().Err(err).Msg("Failed to register user")
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSONResponse(w, http.StatusCreated, map[string]string{"user_id": userID})
}

// LoginUser handles user authentication
func (h *UserHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		log.Error().Err(err).Msg("Failed to decode login credentials")
		h.writeErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.service.LoginUser(credentials.Email, credentials.Password)
	if err != nil {
		log.Error().Err(err).Msg("Login failed")
		h.writeErrorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	token, err := utils.GenerateJWT(user.UserID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate JWT")
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	response := map[string]interface{}{
		"token": token,
		"role":  user.Role,
	}

	if user.Role != "admin" && user.RestaurantId != nil {
		response["restaurant_id"] = *user.RestaurantId
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

// GetUsersByRestaurantID handles retrieving users by restaurant ID
func (h *UserHandler) GetUsersByRestaurantID(w http.ResponseWriter, r *http.Request) {
	_ = utils.TokenVerification(r, w)
	restaurantID := r.URL.Query().Get("restaurantId")
	role := r.URL.Query().Get("role")
	if restaurantID == "" {
		h.writeErrorResponse(w, http.StatusBadRequest, "restaurantId is required")
		return
	}

	users, err := h.service.GetUsersByRestaurantIDAndRole(restaurantID, role)
	responses := make([]dto.UserResponse, len(users))
	for i, u := range users {
		responses[i] = dto.FromUsertoUserResponse(u)
	}
	if err != nil {
		log.Error().Err(err).Msg("Failed to get users by restaurant")
		h.writeErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.writeJSONResponse(w, http.StatusOK, responses)
}
