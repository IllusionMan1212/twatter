package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Conversation struct {
	ID           primitive.ObjectID   `json:"_id" bson:"_id"`
	Members      []primitive.ObjectID `json:"members" bson:"members"`
	Participants []primitive.ObjectID `json:"participants" bson:"participants"`
	LastMessage  string               `json:"lastMessage" bson:"lastMessage"`
	LastUpdated  primitive.DateTime   `json:"lastUpdated" bson:"lastUpdated"`
}
