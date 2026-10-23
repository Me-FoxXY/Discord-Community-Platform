"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export function NatureBanner({ ready }: { ready: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () => setAllowed(!preference.matches && !connection?.saveData);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element || !ready || !allowed || failed) return;
    let visible = true;
    const update = () => {
      if (paused || !visible || document.hidden) element.pause();
      else void element.play().catch(() => setPlaying(false));
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); element.pause(); };
  }, [ready, allowed, paused, failed]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-forest-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/verdanta-default.webp" alt="Verdanta — sunlight through a living forest canopy" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      {ready && allowed && !failed && <>
        <video ref={video} muted loop playsInline preload="metadata" poster="/verdanta-default.webp" aria-label="Verdanta forest film" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover">
          <source src="/verdanta-default.webm" type="video/webm" />
          <source src="/verdanta-default.mp4" type="video/mp4" />
        </video>
        <button type="button" aria-label={playing ? "Pause forest film" : "Play forest film"} onClick={() => {
          if (playing) { setPaused(true); video.current?.pause(); }
          else { setPaused(false); void video.current?.play().catch(() => setPlaying(false)); }
        }} className="absolute bottom-4 left-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-black/50 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </>}
    </div>
  );
}
