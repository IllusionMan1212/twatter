package models

import "go.mongodb.org/mongo-driver/bson/primitive"

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
