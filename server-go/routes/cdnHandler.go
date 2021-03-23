package routes

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func GetProfileImage(w http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	userId := params["userId"]
	fileName := params["fileName"]

	http.ServeFile(w, req, fmt.Sprintf("../cdn/profile_images/%s/%s", userId, fileName))
}

func GetPostImages(w http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	postId := params["postId"]
	fileName := params["fileName"]

	http.ServeFile(w, req, fmt.Sprintf("../cdn/posts/%s/%s", postId, fileName))
}

func GetMessageImage(w http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	messageId := params["messageId"]
	fileName := params["fileName"]

	http.ServeFile(w, req, fmt.Sprintf("../cdn/messages/%s/%s", messageId, fileName))
}
