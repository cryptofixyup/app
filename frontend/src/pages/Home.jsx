import Nav from "../components/sections/Nav";
import Hero from "../components/sections/Hero";
import ThreatFeed from "../components/sections/ThreatFeed";
import InteractiveDemo from "../components/sections/InteractiveDemo";
import Features from "../components/sections/Features";
import HowItWorks from "../components/sections/HowItWorks";
import Stats from "../components/sections/Stats";
import MythosGuard from "../components/sections/MythosGuard";
import Pricing from "../components/sections/Pricing";
import FAQ from "../components/sections/FAQ";
import Footer from "../components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#050505" }} data-testid="home-page">
      <Nav />
      <main>
        <Hero />
        <ThreatFeed />
        <InteractiveDemo />
        <Features />
        <HowItWorks />
        <Stats />
        <MythosGuard />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
