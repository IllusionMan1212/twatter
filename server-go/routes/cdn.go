package routes

import "github.com/gorilla/mux"

func RegisterCdnRoutes(router *mux.Router) {
	cdnRouter := router.PathPrefix("/cdn").Subrouter()

	cdnRouter.HandleFunc("/profile_images/{userId}/{fileName}", GetProfileImage).Methods("GET")
	cdnRouter.HandleFunc("/posts/{postId}/{fileName}", GetPostImages).Methods("GET")
	cdnRouter.HandleFunc("/messages/{messageId}/{fileName}", GetMessageImage).Methods("GET")
}
