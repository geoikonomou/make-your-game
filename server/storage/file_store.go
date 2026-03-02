package storage

import (
	"encoding/json"
	"os"
	"server/model"
	"sync"
)

const dataFile = "scores.json"

var mu sync.Mutex

func LoadScores() ([]model.ScoreEntry, error) {
	mu.Lock()
	defer mu.Unlock()

	data, err := os.ReadFile(dataFile)
	if os.IsNotExist(err) {
		return []model.ScoreEntry{}, nil
	}
	if err != nil {
		return nil, err
	}

	var scores []model.ScoreEntry
	if err := json.Unmarshal(data, &scores); err != nil {
		return nil, err
	}
	return scores, nil
}

func SaveScores(scores []model.ScoreEntry) error {
	mu.Lock()
	defer mu.Unlock()

	data, err := json.MarshalIndent(scores, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(dataFile, data, 0644)
}
