import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Footer } from './ClosingSections'
import { applyAuthorMetadata, Hero } from './HeaderHero'
import { WorldStateSection } from './WorldStateSection'
import { siteConfig } from '../content/research-data'

describe('research interactions', () => {
  afterEach(() => {
    applyAuthorMetadata(false)
    siteConfig.showAuthors = true
  })

  it('adds and fully removes configurable author metadata', () => {
    applyAuthorMetadata(true)
    expect(document.querySelectorAll('meta[data-site-author]')).toHaveLength(3)
    expect(document.querySelector('meta[content="Adip Ranjan Das"]')).toBeInTheDocument()
    applyAuthorMetadata(false)
    expect(document.querySelectorAll('meta[data-site-author]')).toHaveLength(0)
  })

  it('removes author content and mail actions when showAuthors is false', () => {
    siteConfig.showAuthors = false
    const { container } = render(<><Hero /><Footer /></>)
    expect(screen.queryByText('Adip Ranjan Das')).not.toBeInTheDocument()
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull()
    siteConfig.showAuthors = true
  })

  it('keeps unreleased paper and code controls non-navigating', () => {
    render(<><Hero /><Footer /></>)
    const unavailable = screen.getAllByRole('button', { name: /coming soon/i })
    expect(unavailable).toHaveLength(2)
    unavailable.forEach((control) => expect(control).toBeDisabled())
  })

  it('explains one verified removal and shows the updated record without tabs', () => {
    const { container } = render(<WorldStateSection />)
    expect(container.querySelectorAll('.state-example')).toHaveLength(1)
    for (const field of ['global_view', 'local_view', 'assembly_state', 'force_torque']) expect(screen.getByRole('heading', { name: field })).toBeInTheDocument()
    const record = JSON.parse(container.querySelector('.state-display')!.textContent!)
    expect(Object.keys(record)).toEqual(['global_view', 'local_view', 'assembly_state', 'force_torque'])
    expect(record.assembly_state.removed).toContain('holder_screw_03')
    expect(record.assembly_state.last_outcome).toBe('success')
    expect(record).not.toHaveProperty('device_id')
    expect(screen.getByRole('button', { name: 'Copy updated state' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /simulate failed unscrew/i })).not.toBeInTheDocument()
    expect(screen.queryByText('State is ready')).not.toBeInTheDocument()

    expect(screen.queryByText('laptop_illustrative_001', { exact: false })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Laptop', exact: true })).not.toBeInTheDocument()
  })
})
