import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calculator from '../src/components/Calculator'
import { calculate } from '../src/services/calculatorApi'

vi.mock('../src/services/calculatorApi', () => ({
  calculate: vi.fn(),
}))

const mockedCalculate = vi.mocked(calculate)
const invalidInputError = 'Please enter valid numbers for A and B.'

describe('Calculator input validation', () => {
  beforeEach(() => {
    mockedCalculate.mockReset()
  })

  it('rejects submission when both fields are empty', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByText(invalidInputError)).toBeInTheDocument()
    expect(mockedCalculate).not.toHaveBeenCalled()
  })

  it('rejects submission when number A is missing', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number B'), '5')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByText(invalidInputError)).toBeInTheDocument()
    expect(mockedCalculate).not.toHaveBeenCalled()
  })

  it('rejects submission when number B is missing', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number A'), '10')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByText(invalidInputError)).toBeInTheDocument()
    expect(mockedCalculate).not.toHaveBeenCalled()
  })

  it('accepts negative numbers', async () => {
    mockedCalculate.mockResolvedValueOnce(-15)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number A'), '-10')
    await user.type(screen.getByLabelText('Number B'), '-5')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(mockedCalculate).toHaveBeenCalledWith('add', -10, -5)
    expect(screen.queryByText(invalidInputError)).not.toBeInTheDocument()
  })

  it('accepts decimal numbers', async () => {
    mockedCalculate.mockResolvedValueOnce(18.5)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number A'), '10.5')
    await user.type(screen.getByLabelText('Number B'), '8')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(mockedCalculate).toHaveBeenCalledWith('add', 10.5, 8)
  })

  it('accepts zero as a valid operand', async () => {
    mockedCalculate.mockResolvedValueOnce(0)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number A'), '0')
    await user.type(screen.getByLabelText('Number B'), '0')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(mockedCalculate).toHaveBeenCalledWith('add', 0, 0)
    expect(screen.queryByText(invalidInputError)).not.toBeInTheDocument()
  })

  it('clears a previous validation error once valid input is submitted', async () => {
    mockedCalculate.mockResolvedValueOnce(7)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(await screen.findByText(invalidInputError)).toBeInTheDocument()

    await user.type(screen.getByLabelText('Number A'), '3')
    await user.type(screen.getByLabelText('Number B'), '4')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(screen.queryByText(invalidInputError)).not.toBeInTheDocument()
  })
})
