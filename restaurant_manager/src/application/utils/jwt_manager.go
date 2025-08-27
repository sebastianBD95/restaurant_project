package utils

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"restaurant_manager/src/config"
	"strings"
	"time"

	"github.com/lestrrat-go/jwx/v3/jwa"
	"github.com/lestrrat-go/jwx/v3/jwt"
	"github.com/rs/zerolog/log"
)

var privateKey *rsa.PrivateKey
var publicKey *rsa.PublicKey

func SetJWT(cfg *config.Properties) {

	privateKeyPath := cfg.RestaurantManager.JWT.PrivateKeyPath
	publicKeyPath := cfg.RestaurantManager.JWT.PublicKeyPath

	// Fallback to default paths if not configured
	if privateKeyPath == "" {
		privateKeyPath = "resources/private.key"
	}
	if publicKeyPath == "" {
		publicKeyPath = "resources/public.key"
	}

	absPath, err := filepath.Abs(privateKeyPath)
	if err != nil {
		log.Error().Msgf("Failed to access path: %v", absPath)
	}
	privKeyData, err := os.ReadFile(absPath)
	if err != nil {
		log.Error().Msgf("Failed to read private key: %v", err)
	}

	block, _ := pem.Decode(privKeyData)
	if block == nil || block.Type != "PRIVATE KEY" {
		log.Error().Msg("Failed to decode PEM block containing private key")
	}

	privKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		log.Error().Msgf("Failed to parse private key: %v", err)
	}
	privateKey = privKey.(*rsa.PrivateKey)

	absPath, err = filepath.Abs(publicKeyPath)
	if err != nil {
		log.Error().Msgf("Failed to access path: %v", absPath)
	}
	puKeyData, err := os.ReadFile(absPath)
	if err != nil {
		log.Error().Msgf("Failed to read private key: %v", err)
	}
	blockpub, _ := pem.Decode(puKeyData)
	if blockpub == nil || blockpub.Type != "PUBLIC KEY" {
		log.Error().Msg("Failed to decode PEM block containing public key")
	}
	pubKey, err := x509.ParsePKIXPublicKey(blockpub.Bytes)
	if err != nil {
		log.Error().Msgf("Failed to parse public key: %v", err)
	}
	publicKey = pubKey.(*rsa.PublicKey)

}

func GenerateJWT(userID string) (string, error) {
	token, err := jwt.NewBuilder().
		Expiration(time.Now().Add(36 * time.Hour)).
		IssuedAt(time.Now()).
		Subject(userID).
		Build()

	if err != nil {
		log.Error().Msgf("Error: %v", err)
		return "", err
	}
	signedToken, err := jwt.Sign(token, jwt.WithKey(jwa.RS256(), privateKey))
	if err != nil {
		log.Err(err)
		return "", err
	}

	return string(signedToken), nil
}

func verifyJWT(signedToken string) (string, error) {
	tok, err := jwt.Parse([]byte(signedToken), jwt.WithKey(jwa.RS256(), publicKey))
	if err != nil {
		return "", err
	}
	userID, ok := tok.Subject()
	if !ok {
		return "", fmt.Errorf("user ID (sub) not found in token")
	}

	return userID, nil
}

func getBearerToken(r *http.Request) (string, error) {

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("Authorization header missing")
	}

	parts := strings.Fields(authHeader)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", fmt.Errorf("Invalid Authorization header format")
	}
	return parts[1], nil
}

func TokenVerification(r *http.Request, w http.ResponseWriter) string {
	tokenString, err := getBearerToken(r)
	if err != nil {
		http.Error(w, "Authorization header is missing or invalid", http.StatusUnauthorized)
		return ""
	}
	owner, err := verifyJWT(tokenString)
	if err != nil {
		http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
		return ""
	}
	return owner
}
