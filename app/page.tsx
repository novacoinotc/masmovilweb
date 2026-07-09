import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Statement from "@/components/Statement";
import Solutions from "@/components/Solutions";
import Platform from "@/components/Platform";
import Journey from "@/components/Journey";
import ApiSection from "@/components/ApiSection";
import { Capabilities, Security, Compliance, UseCases } from "@/components/Sections";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import ParticleField from "@/components/ParticleField";
import Spotlight from "@/components/Spotlight";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";

export default function Page() {
  return (
    <>
      <ParticleField />
      <Spotlight />
      <div className="noise" aria-hidden="true" />
      <ScrollProgress />
      <CustomCursor />
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />
        <Statement />
        <Solutions />
        <Platform />
        <Journey />
        <Capabilities />
        <ApiSection />
        <Security />
        <Compliance />
        <UseCases />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
