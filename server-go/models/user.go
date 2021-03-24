package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID                           primitive.ObjectID `json:"_id" bson:"_id"`
	Username                     string             `json:"username" bson:"username"`
	DisplayName                  string             `json:"display_name" bson:"display_name"`
	Email                        string             `json:"email" bson:"email"`
	Salt                         string             `json:"salt" bson:"salt"`
	Password                     string             `json:"password" bson:"password"`
	CreatedAt                    primitive.DateTime `json:"createdAt" bson:"createdAt"`
	ProfileImage                 string             `json:"profile_image" bson:"profile_image"`
	Bio                          string             `json:"bio" bson:"bio"`
	Birthday                     primitive.DateTime `json:"birthday" bson:"birthday"`
	ResetPasswordToken           string             `json:"reset_password_token" bson:"reset_password_token"`
	ResetPasswordTokenExpireDate primitive.DateTime `json:"reset_password_token_expiry_date" bson:"reset_password_token_expiry_date"`
	FinishedSetup                bool               `json:"finished_setup" bson:"finished_setup"`
	EmailVerificationToken       string             `json:"email_verification_token" bson:"email_verification_token"`
	VerifiedEmail                bool               `json:"verified_email" bson:"verified_email"`
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

func CheckPasswordHash(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
