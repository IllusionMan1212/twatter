package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID                           primitive.ObjectID `json:"_id" bson:"_id"`
	Username                     string             `json:"username" bson:"_id"`
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

// TODO: setPassword and validatePassword methods here (prob idk)

type Message struct {
	ID           primitive.ObjectID   `json:"_id" bson:"_id"`
	Content      string               `json:"content" bson:"content"`
	SentTime     primitive.DateTime   `json:"sentTime" bson:"sentTime"`
	Attachment   string               `json:"attachment" bson:"attachment"`
	Conversation primitive.ObjectID   `json:"conversation" bson:"conversation"`
	OwnerId      primitive.ObjectID   `json:"ownerId" bson:"ownerId"`
	ReadBy       []primitive.ObjectID `json:"readBy" bson:"readBy"`
}

type Conversation struct {
	ID           primitive.ObjectID   `json:"_id" bson:"_id"`
	Members      []primitive.ObjectID `json:"members" bson:"members"`
	Participants []primitive.ObjectID `json:"participants" bson:"participants"`
	LastMessage  string               `json:"lastMessage" bson:"lastMessage"`
	LastUpdated  primitive.DateTime   `json:"lastUpdated" bson:"lastUpdated"`
}

type Post struct {
	ID          primitive.ObjectID   `json:"_id" bson:"_id"`
	Content     string               `json:"content" bson:"content"`
	Author      primitive.ObjectID   `json:"author" bson:"author"`
	Attachments []string             `json:"attachments" bson:"attachments"`
	CreatedAt   primitive.DateTime   `json:"createdAt" bson:"createdAt"`
	LikeUsers   []string             `json:"likeUsers" bson:"likeUsers"`
	Comments    []primitive.ObjectID `json:"comments" bson:"comments"`
	ReplyingTo  primitive.ObjectID   `json:"replyingTo" bson:"replyingTo"`
}
