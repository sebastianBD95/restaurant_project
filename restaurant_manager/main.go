package main

import (
	"github.com/gorilla/mux"
	"net/http"
)

func main() {

	r := mux.NewRouter()
	r.HandleFunc("/menu", MenuHandler)
	r.HandleFunc("/bill", BillHandler)
	http.Handle("/", r)
}

func MenuHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func BillHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}
