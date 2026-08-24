import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calculator from '../src/components/Calculator'
import { calculate } from '../src/services/calculatorApi'

vi.mock('../src/services/calculatorApi', () => ({
  calculate: vi.fn(),
}))

const mockedCalculate = vi.mocked(calculate)

describe('Calculator component', () => {
  beforeEach(() => {
    mockedCalculate.mockReset()
  })

  it('renders the form fields', () => {
    render(<Calculator />)

    expect(screen.getByLabelText('Number A')).toBeInTheDocument()
    expect(screen.getByLabelText('Operation')).toBeInTheDocument()
    expect(screen.getByLabelText('Number B')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument()
  })

  it('submits the default operation with the entered operands', async () => {
    mockedCalculate.mockResolvedValueOnce(15)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number A'), '10')
    await user.type(screen.getByLabelText('Number B'), '5')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(mockedCalculate).toHaveBeenCalledWith('add', 10, 5)
    expect(await screen.findByText(/Result:/)).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('sends the operation selected by the user', async () => {
    mockedCalculate.mockResolvedValueOnce(50)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number A'), '10')
    await user.selectOptions(screen.getByLabelText('Operation'), 'multiply')
    await user.type(screen.getByLabelText('Number B'), '5')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(mockedCalculate).toHaveBeenCalledWith('multiply', 10, 5)
  })

  it('shows the error message returned by the API', async () => {
    mockedCalculate.mockRejectedValueOnce(new Error('division by zero'))
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number A'), '10')
    await user.type(screen.getByLabelText('Number B'), '0')
    await user.selectOptions(screen.getByLabelText('Operation'), 'divide')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByText('division by zero')).toBeInTheDocument()
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolvePromise: (value: number) => void = () => {}
    mockedCalculate.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve
        }),
    )
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('Number A'), '1')
    await user.type(screen.getByLabelText('Number B'), '2')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()

    resolvePromise(3)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /calculate/i })).not.toBeDisabled(),
    )
  })
})
