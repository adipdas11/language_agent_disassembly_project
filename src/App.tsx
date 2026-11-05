import { useEffect } from 'react'
import { AgentSkillsSection } from './components/AgentSkillsSection'
import { Footer, LimitationsSection, VideoSection } from './components/ClosingSections'
import { ResultsSection } from './components/DevicesResultsSection'
import { Header, Hero, applyAuthorMetadata } from './components/HeaderHero'
import { AbstractSection, ArchitectureSection, DatasetsSection } from './components/OverviewSections'
import { PromptExplorer } from './components/PromptExplorer'
import { WorldStateSection } from './components/WorldStateSection'
import { siteConfig } from './content/research-data'
import './components/content-layout.css'

export default function App() {
  useEffect(() => applyAuthorMetadata(siteConfig.showAuthors), [])
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <AbstractSection />
        <VideoSection />
        <ArchitectureSection />
        <DatasetsSection />
        <WorldStateSection />
        <AgentSkillsSection />
        <ResultsSection />
        <PromptExplorer />
        <LimitationsSection />
      </main>
      <Footer />
    </>
  )
}
