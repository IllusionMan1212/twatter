package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"illusionman1212/twatter-go/db"
	"illusionman1212/twatter-go/routes"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}
	db.InitializeDB()

	router := mux.NewRouter().StrictSlash(true)
	apiRouter := router.PathPrefix("/api/v1").Subrouter()
	cdnRouter := router.PathPrefix("/cdn").Subrouter()
	routes.RegisterUsersRoutes(apiRouter)
	routes.RegisterMessagingRoutes(apiRouter)
	routes.RegisterPostsRoutes(apiRouter)
	routes.RegisterCdnRoutes(cdnRouter)

	port := os.Getenv("PORT")
	fmt.Printf("Listening on %v\n", port)
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("CLIENT_URL")},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Content-Type", "Content-Length", "Accept", "Accept-Encoding"},
		AllowedMethods:   []string{"POST, GET, OPTIONS, PUT, DELETE"},
	})
	handler := c.Handler(router)
	http.ListenAndServe(fmt.Sprintf(":%v", port), handler)
}
