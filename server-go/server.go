package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"illusionman1212/twatter-go/routes"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}
	InitializeDB()

	router := mux.NewRouter().StrictSlash(true).PathPrefix("/api").Subrouter()
	routes.RegisterUsersRoutes(router)
	routes.RegisterMessagingRoutes(router)
	routes.RegisterPostsRoutes(router)
	routes.RegisterCdnRoutes(router)

	port := os.Getenv("PORT")
	fmt.Printf("Listening on %v\n", port)
	http.ListenAndServe(fmt.Sprintf(":%v", port), router)
}
