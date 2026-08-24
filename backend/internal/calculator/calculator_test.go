package calculator

import (
	"math"
	"testing"
)

func ptr(v float64) *float64 {
	return &v
}

func TestCalculate(t *testing.T) {
	tests := []struct {
		name      string
		operation Operation
		a         *float64
		b         *float64
		expected  float64
		wantErr   bool
	}{
		{
			name:      "addition",
			operation: Add,
			a:         ptr(10),
			b:         ptr(5),
			expected:  15,
		},
		{
			name:      "subtraction",
			operation: Subtract,
			a:         ptr(10),
			b:         ptr(5),
			expected:  5,
		},
		{
			name:      "multiplication",
			operation: Multiply,
			a:         ptr(10),
			b:         ptr(5),
			expected:  50,
		},
		{
			name:      "division",
			operation: Divide,
			a:         ptr(10),
			b:         ptr(5),
			expected:  2,
		},
		{
			name:      "decimal division",
			operation: Divide,
			a:         ptr(10),
			b:         ptr(4),
			expected:  2.5,
		},
		{
			name:      "division by zero",
			operation: Divide,
			a:         ptr(10),
			b:         ptr(0),
			wantErr:   true,
		},
		{
			name:      "unknown operation",
			operation: Operation("modulo"),
			a:         ptr(10),
			b:         ptr(5),
			wantErr:   true,
		},
		{
			name:      "missing a",
			operation: Add,
			b:         ptr(5),
			wantErr:   true,
		},
		{
			name:      "missing b",
			operation: Add,
			a:         ptr(10),
			wantErr:   true,
		},
		{
			name:      "missing both operands",
			operation: Add,
			wantErr:   true,
		},
		{
			name:      "empty operation",
			operation: Operation(""),
			a:         ptr(10),
			b:         ptr(5),
			wantErr:   true,
		},
		{
			name:      "negative operands addition",
			operation: Add,
			a:         ptr(-10),
			b:         ptr(-5),
			expected:  -15,
		},
		{
			name:      "negative operands subtraction",
			operation: Subtract,
			a:         ptr(-10),
			b:         ptr(5),
			expected:  -15,
		},
		{
			name:      "negative times positive multiplication",
			operation: Multiply,
			a:         ptr(-10),
			b:         ptr(5),
			expected:  -50,
		},
		{
			name:      "negative division",
			operation: Divide,
			a:         ptr(-10),
			b:         ptr(-5),
			expected:  2,
		},
		{
			name:      "zero operands addition",
			operation: Add,
			a:         ptr(0),
			b:         ptr(0),
			expected:  0,
		},
		{
			name:      "multiply by zero",
			operation: Multiply,
			a:         ptr(5),
			b:         ptr(0),
			expected:  0,
		},
		{
			name:      "zero dividend",
			operation: Divide,
			a:         ptr(0),
			b:         ptr(5),
			expected:  0,
		},
		{
			name:      "division by negative zero",
			operation: Divide,
			a:         ptr(10),
			b:         ptr(math.Copysign(0, -1)),
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := Calculate(tt.operation, tt.a, tt.b)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected an error, got none")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result != tt.expected {
				t.Errorf("expected %v; got %v", tt.expected, result)
			}
		})
	}
}

// Floating-point results compared with a tolerance
func TestCalculateFloatingPointPrecision(t *testing.T) {
	const epsilon = 1e-9

	tests := []struct {
		name      string
		operation Operation
		a, b      float64
		expected  float64
	}{
		{name: "0.1 + 0.2", operation: Add, a: 0.1, b: 0.2, expected: 0.3},
		{name: "1.1 - 1.0", operation: Subtract, a: 1.1, b: 1.0, expected: 0.1},
		{name: "0.1 * 3", operation: Multiply, a: 0.1, b: 3, expected: 0.3},
		{name: "1 / 3", operation: Divide, a: 1, b: 3, expected: 0.3333333333333333},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := Calculate(tt.operation, ptr(tt.a), ptr(tt.b))
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if diff := math.Abs(result - tt.expected); diff > epsilon {
				t.Errorf("expected %v; got %v (diff %v)", tt.expected, result, diff)
			}
		})
	}
}
