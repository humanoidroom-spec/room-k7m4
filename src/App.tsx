import Navigation from './components/Navigation';
import Hero from './sections/Hero';
import { useEffect } from 'react';
import { Collection, Dataset, Tasks, WhyRoom } from './sections/Research';
import Method from './sections/Method';
import { Benchmark, FailureAnalysis, HumanStudy, Resources } from './sections/Experiments';
export default function App() {
  useEffect(() => {
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:0.08});
    document.querySelectorAll('.section-label,.section-heading,.why-layout,.stats,.signal-browser,.task-stage,.collection-layout,.architecture-flow,.failure-definitions,.takeaway-lines').forEach(el=>{el.classList.add('reveal');observer.observe(el);});
    return()=>{observer.disconnect();document.querySelectorAll('.reveal').forEach(el=>el.classList.remove('reveal'));};
  },[]);
  return <><a className="skip-link" href="#main">Skip to content</a><Navigation /><main id="main"><Hero /><WhyRoom /><Dataset /><Tasks /><Collection /><Method /><Benchmark /><FailureAnalysis /><HumanStudy /><Resources /></main></>;
}
