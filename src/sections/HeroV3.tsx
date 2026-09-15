import { project, taskGroups } from '../data/project';
import { useState } from 'react';
import { Arrow, ResearchMedia, SectionLabel } from '../components/Primitives';

export default function HeroV3() {
  return <>
    <section className="hero-v3 home-hero" id="overview" data-design-version="3" data-theme="home" data-layout="immersive">
      <figure className="home-scene home-scene--video">
        <ResearchMedia name={project.media.hero} poster="assets/hero-video-poster.webp" alt="A montage of ROOM household demonstrations showing people and a humanoid coordinating through gestures and everyday actions." eager startAt={5} controls={false} />
      </figure>
      <div className="home-shade" aria-hidden="true" />
      <div className="home-heading">
        <div className="home-identity"><p className="eyebrow">HUMAN–HUMANOID INTERACTION</p><h1>ROOM<span>.</span></h1><p>Learning to understand everyday life.</p></div>
        <div className="home-invitation"><p>A shared space.<br /><em>A little understanding.</em></p><a href="#research">Explore ROOM <span>↓</span></a></div>
      </div>
    </section>
    <div className="hero-signal-strip"><span>A glance</span><i /><span>A gesture</span><i /><span>A shift in posture</span><Arrow /><strong>A helpful response</strong></div>
  </>;
}

export function ResearchIntro() {
  return <section className="research-intro wrap" id="research">
    <p className="eyebrow">A HUMAN–HUMANOID INTERACTION DATASET & BENCHMARK</p>
    <h2><span>ROOM</span>A Human–Humanoid Interaction<br className="desktop-break" /> Manipulation Dataset for<br className="desktop-break" /> <em>Nonverbal Behavior Grounding</em></h2>
    <p className="research-authors">{project.authors} <span>·</span> {project.status}</p>
    <div className="research-links"><a className="button primary" href="#tasks">Interactions <Arrow diagonal /></a><a className="button quiet" href="#dataset">Dataset overview</a><a className="button quiet" href="#method">Method</a><a className="button quiet" href="#experiments">Results</a></div>
    <div className="abstract-block"><h3>Abstract</h3><p>Humanoid collaboration depends on more than a task instruction. A glance can identify an object; a gesture can change a plan; a shift in posture can signal the right moment to help. <strong>ROOM pairs these nonverbal human behaviors with the robot actions they call for.</strong> Its 2.5k demonstrations span 40 interaction tasks, with synchronized human and robot observations at 30 Hz. The benchmark studies how dataset pretraining and different behavior representations support real-robot manipulation, and separates errors in understanding the person from errors in executing an action.</p></div>
  </section>;
}

export function InteractionGallery() {
  const [selected, setSelected] = useState(0);
  const task = taskGroups[selected];
  const select = (step: number) => setSelected(current => (current + step + taskGroups.length) % taskGroups.length);
  return <section className="section interaction-gallery" id="tasks"><div className="wrap">
    <SectionLabel number="01">Everyday moments, shared</SectionLabel>
    <div className="section-heading"><h2>A signal from you.<br /><em>A response from the robot.</em></h2><p>At the table, beside a chair, or moving together.<br />Four evaluation task groups in a shared room.</p></div>
    <div className="gallery-tabs" aria-label="Interaction task gallery">{taskGroups.map((item, i) => <button key={item.id} type="button" className={selected === i ? 'selected' : ''} aria-pressed={selected === i} onClick={() => setSelected(i)}><span>0{i + 1}</span>{item.name}</button>)}</div>
    <div className="gallery-stage">
      <div className="gallery-picture"><ResearchMedia key={task.id} name={task.video} poster={`assets/${task.image}.webp`} alt={`${task.name}: an experimental scene from the ROOM manuscript`} /><span className="gallery-frame-label">EXPERIMENTAL FRAME / {String(selected + 1).padStart(2, '0')}</span></div>
      <div className="gallery-story" aria-live="polite"><p className="eyebrow">{task.family}</p><h3>{task.name}</h3><p className="gallery-description">{task.description}</p><div className="gallery-response"><div><span>HUMAN SIGNAL</span><p>{task.cue}</p></div><Arrow /><div><span>ROBOT RESPONSE</span><p>{task.response}</p></div></div><div className="gallery-steps">{task.sequence.map((step, i) => <span key={step}><small>{i + 1}</small>{step}</span>)}</div><div className="gallery-bottom"><span className="source-note">{task.source} · Representative task group</span><div className="gallery-arrows"><button type="button" aria-label="Previous interaction" onClick={() => select(-1)}>←</button><span>{selected + 1} / 4</span><button type="button" aria-label="Next interaction" onClick={() => select(1)}>→</button></div></div></div>
    </div>
    <div className="gallery-taxonomy"><span>40 TASKS · FOUR INTERACTION FUNCTIONS</span><div>{taskGroups.map((item, i) => <button type="button" key={item.id} aria-pressed={selected === i} className={selected === i ? 'selected' : ''} onClick={() => setSelected(i)}><strong>{item.function}</strong><span>{item.question}</span></button>)}</div></div>
    <p className="section-footnote">Tasks can require more than one grounding function. These are the four evaluation task groups, rather than a complete list of all 40 tasks. Images are real frames from the manuscript.</p>
  </div></section>;
}

export function ResearchRoadmap() {
  return <aside className="research-roadmap wrap" aria-label="Research questions"><div><span className="eyebrow">THE EXPERIMENTS</span><h2>What does it take<br />to understand a person?</h2></div><div>{[
    ['01', 'Does experience across ROOM tasks transfer?', '#experiments', 'Dataset pretraining'],
    ['02', 'Where does an interaction break down?', '#failures', 'Failure analysis'],
    ['03', 'Does nonverbal interaction help the human?', '#human-study', 'Human study'],
  ].map(([n, question, href, label]) => <a href={href} key={n}><span>{n}</span><div><small>{label}</small><strong>{question}</strong></div><Arrow /></a>)}</div></aside>;
}
