package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var User *mongo.Collection
var Message *mongo.Collection
var Conversation *mongo.Collection
var Post *mongo.Collection
var Ctx = context.TODO()

func InitializeDB() {
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGODB_URI"))
	client, err := mongo.Connect(Ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(Ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to mongo")

	DB_Name := os.Getenv("DB_NAME")

	User = client.Database(DB_Name).Collection("users")
	Message = client.Database(DB_Name).Collection("messages")
	Conversation = client.Database(DB_Name).Collection("conversations")
	Post = client.Database(DB_Name).Collection("posts")

	// creates a unique index on the _id field, which also auto generates it
	User.Indexes().CreateMany(Ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "_id", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetMax(16),
		},
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetMin(3),
		},
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "display_name", Value: 1}},
			Options: options.Index().SetMax(16),
		},
		{
			Keys:    bson.D{{Key: "display_name", Value: 1}},
			Options: options.Index().SetMin(1),
		},
	})

	Message.Indexes().CreateOne(Ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})

	Conversation.Indexes().CreateOne(Ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
}
