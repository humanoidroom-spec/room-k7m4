import { useEffect, useRef, useState } from 'react';
import { asset } from '../data/project';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>;
}
export function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="section-label"><span>{number}</span><span>{children}</span></div>;
}
declare const __ROOM_VIDEO_FILES__: string[];
const videoFiles = __ROOM_VIDEO_FILES__;
export function ResearchMedia({ name, poster, alt, className = '', eager = false }: { name: string; poster: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const available = videoFiles.find(path => path.endsWith(`/${name}.webm`)) ?? videoFiles.find(path => path.endsWith(`/${name}.mp4`));
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      const play = visible && !preference.matches;
      setAutoplay(play);
      if (play) { video.muted = true; void video.play().catch(() => {}); } else video.pause();
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }, { threshold: 0.2 });
    observer.observe(video); preference.addEventListener('change', update);
    return () => { observer.disconnect(); preference.removeEventListener('change',update); };
  }, [available, failed]);
  if (available && !failed) return <video ref={videoRef} className={className} src={asset(available.replace('/public/', ''))} poster={asset(poster)} autoPlay={autoplay} muted loop playsInline controls aria-label={alt} preload={eager ? 'auto' : 'metadata'} onError={() => setFailed(true)} />;
  return <img className={className} src={asset(poster)} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" />;
}
