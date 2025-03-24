package utils

import (

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}
func CheckPassword(hashed, plain string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashed),[]byte(plain))
	return err == nil
}
