package routes

import "github.com/gorilla/mux"

func RegisterUsersRoutes(router *mux.Router) {
	userRouter := router.PathPrefix("/users").Subrouter()

	userRouter.HandleFunc("/validateToken", ValidateToken).Methods("GET")
	userRouter.HandleFunc("/getUserData", GetUserData).Methods("GET")
	userRouter.HandleFunc("/validatePasswordResetToken", validatePasswordResetToken).Methods("GET")

	userRouter.HandleFunc("/create", Create).Methods("POST", "OPTIONS")
	userRouter.HandleFunc("/login", Login).Methods("POST")
	userRouter.HandleFunc("/initialSetup", InitialSetup).Methods("POST")
	userRouter.HandleFunc("/forgotPassword", ForgotPassword).Methods("POST")
	userRouter.HandleFunc("/resetPassword", ResetPassword).Methods("POST")

	userRouter.HandleFunc("/logout", Logout).Methods("DELETE")
}
