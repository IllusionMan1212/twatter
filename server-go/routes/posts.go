package routes

import "github.com/gorilla/mux"

func RegisterPostsRoutes(router *mux.Router) {
	postRouter := router.PathPrefix("/posts").Subrouter()

	postRouter.HandleFunc("/deletePost", DeletePost).Methods("POST")
	postRouter.HandleFunc("/likePost", LikePost).Methods("POST")

	postRouter.HandleFunc("/getPosts/{userId}", GetPosts).Methods("GET")
	postRouter.HandleFunc("/getPost", GetPost).Methods("GET")
	postRouter.HandleFunc("/getComments/{postId}", GetComments).Methods("GET")
}
