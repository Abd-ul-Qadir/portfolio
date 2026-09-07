import { ScrollRevealController } from "@/components/effects/ScrollRevealController";
import { JsonLd } from "@/components/seo/JsonLd";
import { homeGraph, projectListGraph } from "@/lib/structured-data";
import { SectionTransitions } from "@/components/effects/SectionTransitions";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Navbar } from "@/components/sections/Navbar";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Skills } from "@/components/sections/Skills";

export default function Home() {
  return (
    <>
      {/* The entity graph: who this is, and every profile that is the same person. */}
      <JsonLd data={homeGraph()} />
      <JsonLd data={projectListGraph()} />
      <ScrollRevealController />
      {/* Phase 12: the boundaries between sections, scrubbed. The hero has no scroll
          transform any more, so this owns every boundary that still has one. */}
      <SectionTransitions />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Services />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
