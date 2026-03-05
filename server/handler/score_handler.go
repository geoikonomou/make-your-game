package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"server/model"
	"server/service"
	"server/storage"
	"time"
)

func HandleGetScores(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	scores, err := storage.LoadScores()
	if err != nil {
		http.Error(w, "Failed to load scores", http.StatusInternalServerError)
		log.Println("GET /scores load error:", err)
		return
	}

	service.SortScores(scores)

	type RankedEntry struct {
		Rank   int    `json:"rank"`
		Name   string `json:"name"`
		Score  int    `json:"score"`
		TimeMs int64  `json:"timeMs"`
		Time   string `json:"time"`
		Date   string `json:"date,omitempty"`
	}

	ranked := make([]RankedEntry, len(scores))
	for i, s := range scores {
		ranked[i] = RankedEntry{
			Rank:   i + 1,
			Name:   s.Name,
			Score:  s.Score,
			TimeMs: s.TimeMs,
			Time:   s.Time,
			Date:   s.Date,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ranked)
}

func HandlePostScore(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type PostScoreRequest struct {
		Name   string `json:"name"`
		Score  int    `json:"score"`
		TimeMs int64  `json:"timeMs"`
	}

	var input PostScoreRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	if input.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	log.Printf("POST /scores  name=%q  score=%d  timeMs=%d\n", input.Name, input.Score, input.TimeMs)

	entry := model.ScoreEntry{
		Name:   input.Name,
		Score:  input.Score,
		TimeMs: input.TimeMs,
		Time:   service.FormatTime(input.TimeMs),
		Date:   time.Now().UTC().Format(time.RFC3339),
	}

	scores, err := storage.LoadScores()
	if err != nil {
		http.Error(w, "Failed to load scores", http.StatusInternalServerError)
		log.Println("POST /scores load error:", err)
		return
	}

	scores = append(scores, entry)

	service.SortScores(scores)

	if err := storage.SaveScores(scores); err != nil {
		http.Error(w, "Failed to save score", http.StatusInternalServerError)
		log.Println("POST /scores save error:", err)
		return
	}

	// Find rank of the new entry
	rank := 1
	for i, s := range scores {
		if s.Name == entry.Name && s.Score == entry.Score && s.TimeMs == entry.TimeMs {
			rank = i + 1
			break
		}
	}

	total := len(scores)
	percentile := int((1 - float64(rank-1)/float64(total)) * 100)
	if percentile < 1 {
		percentile = 1
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"rank":       rank,
		"total":      total,
		"percentile": percentile,
		"entry":      entry,
	})
}
