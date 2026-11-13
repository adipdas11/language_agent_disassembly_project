import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { parsePromptFile, PromptExplorer } from './PromptExplorer'

const fixture = `## Mission template
[source: Project prompt template]
Mission {mission}

## Action template
[source: Project prompt template]
Use {skill_name}`

describe('prompt explorer', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('parses titled source sections', () => {
    expect(parsePromptFile(fixture)).toEqual([
      { title: 'Mission template', source: 'Project prompt template', body: 'Mission {mission}' },
      { title: 'Action template', source: 'Project prompt template', body: 'Use {skill_name}' },
    ])
  })

  it('loads, highlights placeholders, and copies runtime prompt text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(fixture) }))
    const user = userEvent.setup()
    render(<PromptExplorer />)
    expect(await screen.findByText('Mission template')).toBeInTheDocument()
    expect(screen.getByText('Action template')).toBeInTheDocument()
    expect(screen.getByText('{skill_name}')).toBeInTheDocument()
    await user.click(screen.getByText('Action template'))
    await user.click(screen.getByRole('button', { name: /copy action template/i }))
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('shows a non-blocking fallback when the file is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    render(<PromptExplorer />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Prompt file unavailable')
  })
})
