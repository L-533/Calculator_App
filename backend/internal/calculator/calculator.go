package calculator

import "fmt"

type Operation string

const (
	Add      Operation = "add"
	Subtract Operation = "subtract"
	Multiply Operation = "multiply"
	Divide   Operation = "divide"
)

type MathRequest struct {
	Operation Operation `json:"operation"`
	A         *float64  `json:"a"`
	B         *float64  `json:"b"`
}

type MathResponse struct {
	Result float64 `json:"result"`
}

func Calculate(operation Operation, a *float64, b *float64) (float64, error) {
	if a == nil || b == nil {
		return 0, fmt.Errorf("both operands are required")
	}

	switch operation {
	case Add:
		return *a + *b, nil
	case Subtract:
		return *a - *b, nil
	case Multiply:
		return *a * *b, nil
	case Divide:
		if *b == 0 {
			return 0, fmt.Errorf("division by zero")
		}
		return *a / *b, nil
	default:
		return 0, fmt.Errorf("unknown operation")
	}
}
