package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
)

// ─── Score storage ─────────────────────────────────────────────────────────────

type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}

var (
	boardMu    sync.Mutex
	board      []ScoreEntry
	scoresPath string
)

func loadBoard() {
	data, err := os.ReadFile(scoresPath)
	if err != nil {
		return // missing on first run is fine
	}
	_ = json.Unmarshal(data, &board)
}

func saveBoard() {
	data, _ := json.Marshal(board)
	_ = os.WriteFile(scoresPath, data, 0o644)
}

// sanitizeName forces exactly 3 uppercase ASCII letters.
func sanitizeName(s string) string {
	s = strings.ToUpper(strings.TrimSpace(s))
	out := []byte("AAA")
	j := 0
	for _, ch := range s {
		if j >= 3 {
			break
		}
		if ch >= 'A' && ch <= 'Z' {
			out[j] = byte(ch)
			j++
		}
	}
	return string(out)
}

// ─── Handlers ──────────────────────────────────────────────────────────────────

func corsHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func handleScores(w http.ResponseWriter, r *http.Request) {
	corsHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	switch r.Method {

	case http.MethodGet:
		boardMu.Lock()
		out := make([]ScoreEntry, len(board))
		copy(out, board)
		boardMu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(out)

	case http.MethodPost:
		var entry ScoreEntry
		if err := json.NewDecoder(r.Body).Decode(&entry); err != nil || entry.Score <= 0 {
			http.Error(w, "bad request", http.StatusBadRequest)
			return
		}
		entry.Name = sanitizeName(entry.Name)

		boardMu.Lock()
		board = append(board, entry)
		sort.Slice(board, func(i, j int) bool { return board[i].Score > board[j].Score })
		if len(board) > 10 {
			board = board[:10]
		}
		saveBoard()
		out := make([]ScoreEntry, len(board))
		copy(out, board)
		boardMu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(out)

	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

// ─── Main ──────────────────────────────────────────────────────────────────────

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		staticDir = "./static"
	}
	scoresPath = os.Getenv("SCORES_FILE")
	if scoresPath == "" {
		scoresPath = "./scores.json"
	}

	loadBoard()

	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	mux.HandleFunc("/api/scores", handleScores)

	fileServer := http.FileServer(http.Dir(staticDir))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fullPath := filepath.Join(staticDir, filepath.Clean("/"+r.URL.Path))
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
			return
		}
		fileServer.ServeHTTP(w, r)
	})

	log.Printf("Duck Hunt listening on :%s  static=%s  scores=%s", port, staticDir, scoresPath)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
