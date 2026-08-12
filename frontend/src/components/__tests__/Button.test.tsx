import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

function Button({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="bg-cyan-400 text-black px-4 py-2">
      {children}
    </button>
  )
}

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button', { name: /click me/i }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders children text', () => {
    render(<Button onClick={() => {}}>Submit</Button>)
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })
})
