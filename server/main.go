package main

import (
	"log"
	"net/http"
	"server/handler"
	"server/middleware"
)

func main() {
	http.HandleFunc("/scores", middleware.WithCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handler.HandleGetScores(w, r)
		case http.MethodPost:
			handler.HandlePostScore(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	addr := ":8080"
	log.Printf("Arkanoid score server listening on http://localhost%s\n", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
