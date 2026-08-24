package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"Calculator_App/internal/calculator"
)

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
		wantResult float64
	}{
		{
			name:       "addition",
			body:       `{"operation":"add","a":10,"b":5}`,
			wantStatus: http.StatusOK,
			wantResult: 15,
		},
		{
			name:       "subtraction",
			body:       `{"operation":"subtract","a":10,"b":5}`,
			wantStatus: http.StatusOK,
			wantResult: 5,
		},
		{
			name:       "multiplication",
			body:       `{"operation":"multiply","a":10,"b":5}`,
			wantStatus: http.StatusOK,
			wantResult: 50,
		},
		{
			name:       "division",
			body:       `{"operation":"divide","a":10,"b":5}`,
			wantStatus: http.StatusOK,
			wantResult: 2,
		},
		{
			name:       "division by zero",
			body:       `{"operation":"divide","a":10,"b":0}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "exponent",
			body:       `{"operation":"exponent","a":2,"b":10}`,
			wantStatus: http.StatusOK,
			wantResult: 1024,
		},
		{
			name:       "exponent negative exponent",
			body:       `{"operation":"exponent","a":2,"b":-2}`,
			wantStatus: http.StatusOK,
			wantResult: 0.25,
		},
		{
			name:       "unknown operation",
			body:       `{"operation":"modulo","a":10,"b":5}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "invalid body",
			body:       `not-json`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "missing a",
			body:       `{"operation":"add","b":5}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "missing b",
			body:       `{"operation":"add","a":10}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "empty body",
			body:       "",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "wrong type for a",
			body:       `{"operation":"add","a":"10","b":5}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "explicit null a treated as missing",
			body:       `{"operation":"add","a":null,"b":5}`,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "duplicate keys use last value",
			body:       `{"operation":"add","a":1,"a":2,"b":5}`,
			wantStatus: http.StatusOK,
			wantResult: 7,
		},
		{
			name:       "number out of float64 range",
			body:       `{"operation":"add","a":1e400,"b":5}`,
			wantStatus: http.StatusBadRequest,
		},
	}

	s := &Server{}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", strings.NewReader(tt.body))
			rec := httptest.NewRecorder()

			s.CalculateHandler(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("expected status %d; got %d", tt.wantStatus, rec.Code)
			}
			if tt.wantStatus != http.StatusOK {
				return
			}

			var resp calculator.MathResponse
			if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
				t.Fatalf("error decoding response body. Err: %v", err)
			}
			if resp.Result != tt.wantResult {
				t.Errorf("expected result %v; got %v", tt.wantResult, resp.Result)
			}
		})
	}
}

// json.Decoder reads only the first JSON value and silently ignores
// anything after it in the body.
func TestCalculateHandler_TrailingDataIgnored(t *testing.T) {
	s := &Server{}
	body := `{"operation":"add","a":10,"b":5} this is trailing garbage`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", strings.NewReader(body))
	rec := httptest.NewRecorder()

	s.CalculateHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d; got %d", http.StatusOK, rec.Code)
	}
}

func TestCalculateHandler_MethodNotAllowed(t *testing.T) {
	s := &Server{}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/calculate", nil)
	rec := httptest.NewRecorder()

	s.CalculateHandler(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status %v; got %v", http.StatusMethodNotAllowed, rec.Code)
	}
}

func TestRegisterRoutes_CorsPreflight(t *testing.T) {
	s := &Server{}
	server := httptest.NewServer(s.RegisterRoutes())
	defer server.Close()

	req, err := http.NewRequest(http.MethodOptions, server.URL+"/api/v1/calculate", nil)
	if err != nil {
		t.Fatalf("error creating request. Err: %v", err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("error making request to server. Err: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("expected status %v; got %v", http.StatusNoContent, resp.Status)
	}
	if got := resp.Header.Get("Access-Control-Allow-Methods"); got == "" {
		t.Errorf("expected Access-Control-Allow-Methods header to be set")
	}
}
