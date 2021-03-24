package routes

import (
	"encoding/json"
	"illusionman1212/twatter-go/db"
	"illusionman1212/twatter-go/models"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ValidateToken(w http.ResponseWriter, req *http.Request) {

}

func GetUserData(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	username := req.URL.Query().Get("username")
	var user models.User

	if username == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{ "message": "Invalid or incomplete request", "status": 400, "success": false }`))
		return
	}

	// TODO: unselect the unneeded fields and set them as omitempty in the struct
	err := db.User.FindOne(db.Ctx, bson.M{"username": username}, options.FindOne().SetProjection(bson.M{"password": 0})).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{ "message": "Not found", "status": 404, "success": false }`))
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{ "message": "An error has occurred", "status": 500, "success": false }`))
			log.Panic(err)
		}
		return
	}

	data, err := json.Marshal(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{ "message": "An error has occurred", "status": 500, "success": false }`))
		log.Panic(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{
		"message": "Retrieved user data successfully",
		"status": 200,
		"success": true,
		"user": ` + string(data) + `
	}`))
}

func validatePasswordResetToken(w http.ResponseWriter, req *http.Request) {

}

func Create(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	req.ParseMultipartForm(10 << 20)

	username := strings.ToLower(strings.TrimSpace(req.Form.Get("username")))
	email := strings.ToLower(strings.TrimSpace(req.Form.Get("email")))
	password := strings.TrimSpace(req.Form.Get("password"))
	confirmPassword := strings.TrimSpace(req.Form.Get("confirm_password"))

	if username == "" || email == "" || password == "" || confirmPassword == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{ "message": "Invalid or incomplete request", "status": 400, "success": false }`))
		return
	}

	if len(username) < 3 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{ "message": "Username is too short, you need at least 3 characters", "status": 400, "success": false }`))
		return
	}

	if len(username) > 16 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{ "message": "Username cannot be longer than 16 characters", "status": 400, "success": false }`))
		return
	}

	regex := regexp.MustCompile(`(?i)^[a-z0-9_]+$`)
	if !regex.MatchString(username) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{ "message": "Username cannot contain special characters", "status": 400, "success": false }`))
		return
	}

	if len(password) < 8 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{ "message": "Password is too short, you need at least 8 characters", "status": 400, "success": false }`))
		return
	}

	if password != confirmPassword {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{ "message": "Passwords don't match", "status": 400, "success": false }`))
		return
	}

	var user models.User

	user.ID = primitive.NewObjectIDFromTimestamp(time.Now())
	user.Username = username
	user.DisplayName = strings.TrimSpace(req.FormValue("username"))
	user.Email = email
	hash, err := models.HashPassword(password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{ "message": "An error has occurred", "status": 500, "success": false }`))
		log.Panic(err)
		return
	}
	user.Password = hash

	// TODO: do the default values

	_, err = db.User.InsertOne(db.Ctx, user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{ "message": "An error has occurred", "status": 500, "success": false }`))
		log.Panic(err)
		return
	}
	w.WriteHeader(http.StatusCreated)
	// TODO: set session cookie
	w.Write([]byte(`{ "message": "Successfully created a new account", "status": 201, "success": true }`))
}

func Login(w http.ResponseWriter, req *http.Request) {

}

func InitialSetup(w http.ResponseWriter, req *http.Request) {

}

func ForgotPassword(w http.ResponseWriter, req *http.Request) {

}

func ResetPassword(w http.ResponseWriter, req *http.Request) {

}

func Logout(w http.ResponseWriter, req *http.Request) {

}
