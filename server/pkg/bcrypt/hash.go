package bcrypt

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func BcryptForPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	fmt.Println("Hashed password:", string(hashed))

	hashedString := string(hashed)
	return hashedString, nil
}

func ValidatePassword(password string, hashedPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false, err
	}
	return true, nil
}
