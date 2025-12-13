package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type User struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"id,omitempty"`
	Name      string             `json:"name" bson:"name"`
	Email     string             `json:"email" bson:"email"`
	CreatedAt time.Time          `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
	UpdatedAt time.Time          `json:"updatedAt,omitempty" bson:"updatedAt,omitempty"`
	ImageLink string             `json:"imageLink,omitempty" bson:"imageLink,omitempty"`
	Password  string             `json:"password,omitempty" bson:"password,omitempty"`
}

type CheckUserPremiumResponse struct {
	IsActive  bool      `json:"isActive" db:"is_active"`
	StartDate time.Time `json:"startDate" db:"start_date"`
	EndDate   time.Time `json:"endDate" db:"end_date"`
	PlanName  string    `json:"planName" db:"plan_name"`
}

type ForgetPasswordRequestBody struct {
	Email  string `json:"email"`
	UserId string `json:"userId"`
}

type ResetPasswordRequestBody struct {
	Email       string `json:"email"`
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}
