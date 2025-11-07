package njwt

import (
	"github.com/golang-jwt/jwt/v5"
	"os"
	"time"
)

var JWTSECRET = []byte(os.Getenv("JWT_SECRET"))

func CreateAccessAndRefreshToken(email string) (string, string, error) {
	// create refresh token
	refreshClaims := jwt.MapClaims{
		"email": email,
		"type":  "refresh",
		"exp":   time.Now().Add(7 * 24 * time.Hour).Unix(), // 7 days
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshString, err := refreshToken.SignedString(JWTSECRET)
	if err != nil {
		return "", "", nil
	}

	// create Access token
	accessClaims := jwt.MapClaims{
		"email": email,
		"type":  "access",
		"exp":   time.Now().Add(48 * time.Hour).Unix(), // 7 days
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessString, err := accessToken.SignedString(JWTSECRET)
	
	if err != nil {
		return "", "", err
	}

	return accessString, refreshString, nil
}
