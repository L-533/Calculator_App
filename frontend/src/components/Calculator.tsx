import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { calculate } from '../services/calculatorApi'
import type { Operation } from '../types/calculator'
import "./Calculator.css";


const OPERATIONS: { value: Operation; label: string }[] = [
  { value: 'add', label: 'Addition' },
  { value: 'subtract', label: 'Subtraction' },
  { value: 'multiply', label: 'Multiplication' },
  { value: 'divide', label: 'Division' },
  { value: 'exponent', label: 'Exponent' },
]


function Calculator() {
  const [numberA, setNumberA] = useState('')
  const [operation, setOperation] = useState<Operation>('add')
  const [numberB, setNumberB] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    const a = parseFloat(numberA)
    const b = parseFloat(numberB)
    if (Number.isNaN(a) || Number.isNaN(b)) {
      setError('Please enter valid numbers for A and B.')
      return
    }

    setLoading(true)
    try {
      const calculatedResult = await calculate(operation, a, b)
      setResult(calculatedResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <form className="calculator-card" onSubmit={handleSubmit}>
        <h1 className="calculator-title">Calculator</h1>

        <div className="field">
          <label htmlFor="numberA">Number A</label>
          <input
            id="numberA"
            type="number"
            value={numberA}
            onChange={(e) => setNumberA(e.target.value)}
            placeholder="Type a number"
          />
        </div>

        <div className="field">
          <label htmlFor="operation">Operation</label>
          <select
            id="operation"
            value={operation}
            onChange={(e) => setOperation(e.target.value as Operation)}
          >
            {OPERATIONS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="numberB">Number B</label>
          <input
            id="numberB"
            type="number"
            value={numberB}
            onChange={(e) => setNumberB(e.target.value)}
            placeholder="Type a number"
          />
        </div>

        <button className="calculate-btn" type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate'}
        </button>

        {error && <p className="calculator-error">{error}</p>}
        {result !== null && (
          <p className="calculator-result">
            Result: <span className="result-value">{result}</span>
          </p>
        )}
      </form>
    </div>
  )
}

export default Calculator