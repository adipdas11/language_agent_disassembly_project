import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Footer } from './ClosingSections'
import { applyAuthorMetadata, Hero } from './HeaderHero'
import { AgentSkillsSection } from './AgentSkillsSection'
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

  it('shows every decision example without scenario tabs', () => {
    render(<AgentSkillsSection />)
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    for (const name of ['Successful removal', 'Misaligned contact', 'Failed grasp', 'Newly revealed part']) expect(screen.getByRole('heading', { name })).toBeInTheDocument()
  })

  it('shows all formatted device states without switching or collapsing fields', () => {
    render(<WorldStateSection />)
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: /simulate failed unscrew/i })).not.toBeInTheDocument()
    expect(screen.queryByText('State is ready')).not.toBeInTheDocument()

    expect(screen.getByText('laptop_illustrative_001', { exact: false })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Laptop', exact: true })).not.toBeInTheDocument()
  })
})
