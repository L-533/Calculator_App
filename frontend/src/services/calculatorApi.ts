import type { CalculateResponse, Operation } from '../types/calculator'

// Set VITE_API_URL only when the frontend is deployed as a separate service from the backend.
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function calculate(
	operation: Operation,
	a: number,
	b: number,
): Promise<number> {
	const response = await fetch(`${API_BASE}/api/v1/calculate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ operation, a, b }),
	})

	// Handle the response and parse the JSON data
	const text = await response.text()
	let data: (CalculateResponse & { message?: string }) | undefined
	try {
		data = text ? (JSON.parse(text) as CalculateResponse & { message?: string }) : undefined
	} catch {
		data = undefined
	}

	if (!response.ok) {
		throw new Error(data?.message || text || 'Failed to calculate')
	}
	if (!data) {
		throw new Error('Empty response from server')
	}

	return data.result
}