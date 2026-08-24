export type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'exponent'

export type CalculateRequest = {
	operation: Operation
	a: number
	b: number
}

export type CalculateResponse = {
	result: number
}
