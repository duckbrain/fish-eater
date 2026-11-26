package main

import (
	"embed"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"
	"unicode/utf8"
)

//go:embed index.html game.html favicon.ico manifest.json manifest.appcache css js img audio fonts
var static embed.FS

const (
	maxEntries = 20
	maxNameLen = 20
	// Upper bound of PlayerFish.getScore().total at game over; derivation in the commit message.
	maxScore = 80484
)

type Entry struct {
	Name  string    `json:"name"`
	Score int       `json:"score"`
	Time  time.Time `json:"time"`
}

type Board struct {
	mu      sync.Mutex
	path    string
	entries []Entry
}

func loadBoard(path string) (*Board, error) {
	b := &Board{path: path, entries: []Entry{}}
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return b, nil
	}
	if err != nil {
		return nil, err
	}
	var entries []Entry
	if err := json.Unmarshal(data, &entries); err != nil {
		return nil, err
	}
	for _, e := range entries {
		b.Add(e)
	}
	return b, nil
}

func (b *Board) List() []Entry {
	b.mu.Lock()
	defer b.mu.Unlock()
	return slices.Clone(b.entries)
}

func (b *Board) Add(e Entry) ([]Entry, error) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if j := slices.IndexFunc(b.entries, func(x Entry) bool { return strings.EqualFold(x.Name, e.Name) }); j >= 0 {
		if b.entries[j].Score >= e.Score {
			return slices.Clone(b.entries), nil
		}
		b.entries = slices.Delete(b.entries, j, j+1)
	}

	i, _ := slices.BinarySearchFunc(b.entries, e.Score, func(x Entry, score int) int {
		return score - x.Score
	})
	for i < len(b.entries) && b.entries[i].Score == e.Score {
		i++
	}
	if i >= maxEntries {
		return slices.Clone(b.entries), nil
	}
	b.entries = slices.Insert(b.entries, i, e)
	if len(b.entries) > maxEntries {
		b.entries = b.entries[:maxEntries]
	}
	return slices.Clone(b.entries), b.save()
}

func (b *Board) save() error {
	data, err := json.MarshalIndent(b.entries, "", "  ")
	if err != nil {
		return err
	}
	tmp, err := os.CreateTemp(filepath.Dir(b.path), ".scores-*.json")
	if err != nil {
		return err
	}
	defer os.Remove(tmp.Name())
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmp.Name(), b.path)
}

func validName(name string) bool {
	if name == "" || !utf8.ValidString(name) || utf8.RuneCountInString(name) > maxNameLen {
		return false
	}
	for _, r := range name {
		if !unicode.IsPrint(r) && r != '‍' {
			return false
		}
	}
	return true
}

func cors(origins []string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); slices.Contains(origins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Add("Vary", "Origin")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func main() {
	addr := flag.String("addr", ":8080", "listen address")
	dataPath := flag.String("data", "scores.json", "path to the scores file")
	origins := flag.String("origins", "https://duckbrain.github.io", "comma-separated CORS origins")
	flag.Parse()

	board, err := loadBoard(*dataPath)
	if err != nil {
		log.Fatalf("loading %s: %v", *dataPath, err)
	}

	api := http.NewServeMux()
	api.HandleFunc("GET /api/scores", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, board.List())
	})
	api.HandleFunc("POST /api/scores", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 4096)
		name := strings.TrimSpace(r.FormValue("name"))
		score, err := strconv.Atoi(r.FormValue("score"))
		if !validName(name) || err != nil || score <= 0 || score > maxScore {
			http.Error(w, "invalid name or score", http.StatusBadRequest)
			return
		}
		entries, err := board.Add(Entry{Name: name, Score: score, Time: time.Now().UTC()})
		if err != nil {
			log.Printf("saving scores: %v", err)
			http.Error(w, "failed to save", http.StatusInternalServerError)
			return
		}
		writeJSON(w, entries)
	})

	mux := http.NewServeMux()
	mux.Handle("/api/", cors(strings.Split(*origins, ","), api))
	mux.Handle("/", http.FileServerFS(static))

	log.Printf("listening on %s", *addr)
	log.Fatal(http.ListenAndServe(*addr, mux))
}
