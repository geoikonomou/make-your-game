package model

type ScoreEntry struct {
	Name   string `json:"name"`
	Score  int    `json:"score"`
	TimeMs int64  `json:"timeMs"`
	Time   string `json:"time"`
	Date   string `json:"date,omitempty"`
}
