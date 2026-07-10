"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useMotionValue,
  useScroll,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";

/**
 * TimeProvider — el reloj maestro de «Anatomía de un segundo».
 * ms: MotionValue 0→1000 escrito por las escenas sticky (cada una posee su rango).
 * live: tras el beat, el cronómetro conmuta a reloj real.
 * frozen: el kill switch congela TODO (data-frozen en <html> + rAF con early-return).
 */
type Fila = { id: number; hora: string; tipo: string; monto: string; estado: string; kind?: "ok" | "rej" | "sol" };

type TimeCtx = {
  ms: MotionValue<number>;
  frozen: boolean;
  setFrozen: (v: boolean) => void;
  live: boolean;
  setLive: (v: boolean) => void;
  registrarFilaFeed: (f: Omit<Fila, "id">) => void;
  onFila: (cb: (f: Fila) => void) => () => void;
};

const Ctx = createContext<TimeCtx | null>(null);

export function TimeProvider({ children }: { children: ReactNode }) {
  const ms = useMotionValue(0);
  const [frozen, setFrozenState] = useState(false);
  const [live, setLive] = useState(false);
  const subs = useRef(new Set<(f: Fila) => void>());
  const nextId = useRef(1000);

  const setFrozen = useCallback((v: boolean) => {
    setFrozenState(v);
    document.documentElement.dataset.frozen = String(v);
  }, []);

  const registrarFilaFeed = useCallback((f: Omit<Fila, "id">) => {
    nextId.current += 1;
    const fila = { id: nextId.current, ...f };
    subs.current.forEach((cb) => cb(fila));
  }, []);

  const onFila = useCallback((cb: (f: Fila) => void) => {
    subs.current.add(cb);
    return () => {
      subs.current.delete(cb);
    };
  }, []);

  useEffect(() => () => {
    delete document.documentElement.dataset.frozen;
  }, []);

  const value = useMemo(
    () => ({ ms, frozen, setFrozen, live, setLive, registrarFilaFeed, onFila }),
    [ms, frozen, setFrozen, live, registrarFilaFeed, onFila]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTime() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTime debe usarse dentro de TimeProvider");
  return ctx;
}

export type { Fila };

/**
 * useSceneMs — cada escena sticky posee un rango [from,to] del segundo.
 * Escribe el reloj maestro solo mientras su progreso está en (0,1).
 */
export function useSceneMs(
  ref: React.RefObject<HTMLElement | null>,
  from: number,
  to: number,
  offset: ["start start", "end end"] | ["start 0.8", "end 0.2"] = ["start start", "end end"]
) {
  const { ms } = useTime();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p > 0 && p < 1) ms.set(from + (to - from) * p);
  });
  return scrollYProgress;
}
