import { useEffect } from "react";
import { Header, Hero, applyAuthorMetadata } from "./components/HeaderHero";
import {
  AbstractSection,
  ArchitectureSection,
  DatasetsSection,
} from "./components/OverviewSections";
import { WorldStateSection } from "./components/WorldStateSection";
import { ResultsSection } from "./components/DevicesResultsSection";
import { PromptExplorer } from "./components/PromptExplorer";
import { ConclusionSection, Footer } from "./components/ClosingSections";
import { siteConfig } from "./content/research-data";
import "./components/v1.css";

export default function App() {
  useEffect(() => applyAuthorMetadata(siteConfig.showAuthors), []);
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <AbstractSection />
        <ArchitectureSection />
        <DatasetsSection />
        <WorldStateSection />
        <PromptExplorer />
        <ResultsSection />
        <ConclusionSection />
      </main>
      <Footer />
    </>
  );
}
