package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Message struct {
	ID           primitive.ObjectID   `json:"_id" bson:"_id"`
	Content      string               `json:"content" bson:"content"`
	SentTime     primitive.DateTime   `json:"sentTime" bson:"sentTime"`
	Attachment   string               `json:"attachment" bson:"attachment"`
	Conversation primitive.ObjectID   `json:"conversation" bson:"conversation"`
	OwnerId      primitive.ObjectID   `json:"ownerId" bson:"ownerId"`
	ReadBy       []primitive.ObjectID `json:"readBy" bson:"readBy"`
}
