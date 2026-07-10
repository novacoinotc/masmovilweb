import { TimeProvider } from "@/lib/time";
import { Nav2, MillisecondScrubber } from "@/components/Chrome";
import Hero2 from "@/components/scenes/Hero2";
import Stack from "@/components/scenes/Stack";
import ActoFirma from "@/components/scenes/ActoFirma";
import ActoEscrutinio from "@/components/scenes/ActoEscrutinio";
import ActoFrontera from "@/components/scenes/ActoFrontera";
import ActoCep from "@/components/scenes/ActoCep";
import ActoEnVivo from "@/components/scenes/ActoEnVivo";
import Operadores from "@/components/scenes/Operadores";
import Acceso from "@/components/scenes/Acceso";
import TierraLegal from "@/components/scenes/TierraLegal";
import ParticleField from "@/components/ParticleField";
import Spotlight from "@/components/Spotlight";
import CustomCursor from "@/components/CustomCursor";

export default function Page() {
  return (
    <TimeProvider>
      <ParticleField />
      <div className="vignette" aria-hidden="true" />
      <Spotlight />
      <CustomCursor />
      <Nav2 />
      <main>
        <Hero2 />
        <Stack />
        <ActoFirma />
        <ActoEscrutinio />
        <ActoFrontera />
        <ActoCep />
        <ActoEnVivo />
        <Operadores />
        <Acceso />
      </main>
      <TierraLegal />
      <MillisecondScrubber />
    </TimeProvider>
  );
}
