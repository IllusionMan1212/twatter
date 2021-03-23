package routes

import "github.com/gorilla/mux"

func RegisterMessagingRoutes(router *mux.Router) {
	messagingRouter := router.PathPrefix("/messaging").Subrouter()

	messagingRouter.HandleFunc("/startConversation", StartConversation).Methods("POST")

	messagingRouter.HandleFunc("/getConversation", GetConversation).Methods("GET")
	messagingRouter.HandleFunc("/getMessages/{conversationId}", GetMessages).Methods("GET")
	messagingRouter.HandleFunc("/getUnreadMessages", GetUnreadMessages).Methods("GET")
}
