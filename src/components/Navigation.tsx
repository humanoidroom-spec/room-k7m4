import { useEffect, useState } from 'react';
import { Arrow } from './Primitives';
export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 32); update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  useEffect(() => { const close = (event: KeyboardEvent) => { if(event.key === 'Escape') setOpen(false); }; window.addEventListener('keydown',close); return () => window.removeEventListener('keydown',close); }, []);
  return <header className={`nav ${scrolled ? 'compact' : ''}`}><a href="#" className="wordmark" aria-label="ROOM home">R<span>OO</span>M<span className="logo-period">.</span></a><nav id="main-nav" aria-label="Main navigation" className={open ? 'open' : ''}>{[['overview','Overview'],['dataset','Dataset'],['tasks','Tasks'],['method','Method'],['experiments','Experiments']].map(([id,label]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}</nav><a className="nav-paper" href="#resources">Resources <Arrow diagonal /></a><button className="menu-toggle" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button></header>;
}
