import {
  NavCredito,
  HeroCredito,
  Financiamos,
  ComoFunciona,
  Formacion,
  SoftwareFintech,
  Telecom,
  Solicitud,
  FooterCredito,
} from "@/components/credito/Home";
import ParticleField from "@/components/ParticleField";
import SmoothScroll from "@/components/SmoothScroll";
import Spotlight from "@/components/Spotlight";
import CustomCursor from "@/components/CustomCursor";

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <ParticleField />
      <div className="vignette" aria-hidden="true" />
      <Spotlight />
      <CustomCursor />
      <NavCredito />
      <main>
        <HeroCredito />
        <Financiamos />
        <ComoFunciona />
        <Formacion />
        <SoftwareFintech />
        <Telecom />
        <Solicitud />
      </main>
      <FooterCredito />
    </>
  );
}
