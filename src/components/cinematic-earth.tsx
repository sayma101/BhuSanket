'use client';

import {useState} from 'react';
import {Pause, Play} from 'lucide-react';
import {EarthGlobe} from './earth-globe';

export function CinematicEarth() {
  const [paused,setPaused]=useState(false);
  return <div className={`cinematic-earth scene-orbit ${paused?'scene-paused':''}`}>
    <div className="orbit-earth"><EarthGlobe /></div>
    <div className="delta-shade" />
    <button className="hero-motion-toggle" aria-label={paused?'Resume Earth atmosphere motion':'Pause Earth atmosphere motion'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?<Play size={17}/>:<Pause size={17}/>}</button>
  </div>;
}
