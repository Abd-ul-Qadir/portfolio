import { SectionChoreography } from "@/components/effects/SectionChoreography";
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
      {/* Phase 12: the boundaries between sections, scrubbed. Hero -> About lives in
          HeroChoreography's own timeline; this owns the other three. */}
      <SectionTransitions />
      {/* Each section's content flies in, holds still while it is being read, then leaves in
          another direction — all scrubbed to scroll. Renders nothing itself; it finds each
          section's `[data-section-inner]` container. */}
      <SectionChoreography />
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
