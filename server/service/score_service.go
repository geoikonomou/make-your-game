package service

import (
	"fmt"
	"server/model"
	"sort"
)

func FormatTime(ms int64) string {
	total := ms / 1000
	min := total / 60
	sec := total % 60
	return fmt.Sprintf("%d:%02d", min, sec)
}

func SortScores(scores []model.ScoreEntry) {
	sort.Slice(scores, func(i, j int) bool {
		if scores[i].Score != scores[j].Score {
			return scores[i].Score > scores[j].Score
		}
		return scores[i].TimeMs < scores[j].TimeMs
	})
}
