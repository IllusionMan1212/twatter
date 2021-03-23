package main

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

	User = client.Database("unnamed").Collection("users")
	Message = client.Database("unnamed").Collection("messages")
	Conversation = client.Database("unnamed").Collection("conversations")
	Post = client.Database("unnamed").Collection("posts")

	// creates a unique index on the _id field, which also auto generates it
	User.Indexes().CreateOne(Ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})

	User.Indexes().CreateOne(Ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "username", Value: 1}},
		Options: options.Index().SetUnique(true),
	})

	User.Indexes().CreateOne(Ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
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
