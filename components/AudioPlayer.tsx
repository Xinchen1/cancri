
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Brain, Heart, Zap, Waves } from 'lucide-react';
import { AudioPreset } from '../types';

interface AudioPlayerProps {
  isPlaying: boolean;
  preset: AudioPreset;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, preset }) => {
  const [muted, setMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<(OscillatorNode | AudioBufferSourceNode | BiquadFilterNode)[]>([]);
  const currentPresetRef = useRef<AudioPreset>(preset);

  // Solfeggio & Brainwave helpers
  const createOsc = (ctx: AudioContext, freq: number, type: OscillatorType = 'sine', gainVal = 1) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.value = gainVal;
    osc.connect(g);
    return { osc, gain: g };
  };

  const initCelestial = (ctx: AudioContext, dest: AudioNode) => {
    const { osc: o1, gain: g1 } = createOsc(ctx, 432, 'sine', 0.1);
    const { osc: o2, gain: g2 } = createOsc(ctx, 436, 'sine', 0.1);
    const { osc: o3, gain: g3 } = createOsc(ctx, 108, 'sine', 0.3);
    [g1, g2, g3].forEach(g => g.connect(dest));
    [o1, o2, o3].forEach(o => o.start());
    return [o1, o2, o3];
  };

  const initAwakening = (ctx: AudioContext, dest: AudioNode) => {
    // 963Hz Solfeggio + 40Hz Gamma Binaural pulse
    const { osc: o1, gain: g1 } = createOsc(ctx, 963, 'sine', 0.05);
    const { osc: o2, gain: g2 } = createOsc(ctx, 40, 'sine', 0.15); // Deep Gamma pulse
    const { osc: o3, gain: g3 } = createOsc(ctx, 963.5, 'sine', 0.03); // Slight detune for shimmer
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 500;
    
    g1.connect(filter);
    g3.connect(filter);
    g2.connect(dest);
    filter.connect(dest);
    
    [o1, o2, o3].forEach(o => o.start());
    return [o1, o2, o3];
  };

  const initLove = (ctx: AudioContext, dest: AudioNode) => {
    // 528Hz DNA Repair / Love Frequency
    const { osc: o1, gain: g1 } = createOsc(ctx, 528, 'sine', 0.15);
    const { osc: o2, gain: g2 } = createOsc(ctx, 264, 'sine', 0.2); // Harmonic sub
    const { osc: o3, gain: g3 } = createOsc(ctx, 528.2, 'sine', 0.05);
    
    [g1, g2, g3].forEach(g => g.connect(dest));
    [o1, o2, o3].forEach(o => o.start());
    return [o1, o2, o3];
  };

  const initIntuition = (ctx: AudioContext, dest: AudioNode) => {
    // 852Hz Returning to Spiritual Order + 6.3Hz Theta
    const { osc: o1, gain: g1 } = createOsc(ctx, 852, 'sine', 0.08);
    const { osc: o2, gain: g2 } = createOsc(ctx, 6.3, 'sine', 0.4); // Deep Theta for subconscious
    
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(g1.gain); // Pulsing effect
    
    [g1, g2].forEach(g => g.connect(dest));
    [o1, o2, lfo].forEach(o => o.start());
    return [o1, o2, lfo];
  };

  const initGrounding = (ctx: AudioContext, dest: AudioNode) => {
    const { osc: o1, gain: g1 } = createOsc(ctx, 136.1, 'sine', 0.1);
    const { osc: o2, gain: g2 } = createOsc(ctx, 7.83, 'sine', 0.4); // Schumann
    [g1, g2].forEach(g => g.connect(dest));
    [o1, o2].forEach(o => o.start());
    return [o1, o2];
  };

  const initFocus = (ctx: AudioContext, dest: AudioNode) => {
    const { osc: o1, gain: g1 } = createOsc(ctx, 200, 'sine', 0.1);
    const { osc: o2, gain: g2 } = createOsc(ctx, 210, 'sine', 0.1);
    [g1, g2].forEach(g => g.connect(dest));
    [o1, o2].forEach(o => o.start());
    return [o1, o2];
  };

  const stopOscillators = () => {
    oscillatorsRef.current.forEach(node => {
        try { 
            if ('stop' in node) (node as OscillatorNode).stop();
            node.disconnect();
        } catch(e) {}
    });
    oscillatorsRef.current = [];
  };

  const initAudio = () => {
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        const masterGain = audioContextRef.current.createGain();
        masterGain.gain.value = 0.0;
        masterGain.connect(audioContextRef.current.destination);
        masterGainRef.current = masterGain;
    }
    if (!masterGainRef.current || !audioContextRef.current) return;
    stopOscillators();
    
    const ctx = audioContextRef.current;
    const dest = masterGainRef.current;

    switch(preset) {
        case AudioPreset.AWAKENING: oscillatorsRef.current = initAwakening(ctx, dest); break;
        case AudioPreset.LOVE: oscillatorsRef.current = initLove(ctx, dest); break;
        case AudioPreset.INTUITION: oscillatorsRef.current = initIntuition(ctx, dest); break;
        case AudioPreset.GROUNDING: oscillatorsRef.current = initGrounding(ctx, dest); break;
        case AudioPreset.FOCUS: oscillatorsRef.current = initFocus(ctx, dest); break;
        default: oscillatorsRef.current = initCelestial(ctx, dest);
    }
    currentPresetRef.current = preset;
  };

  useEffect(() => {
    if (userInteracted && audioContextRef.current && currentPresetRef.current !== preset) {
        initAudio();
    }
  }, [preset, userInteracted]);

  useEffect(() => {
    const handleInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        if (!audioContextRef.current) initAudio();
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
      }
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, [userInteracted]);

  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      const targetVolume = (!muted && isPlaying) ? 0.15 : 0;
      masterGainRef.current.gain.setTargetAtTime(targetVolume, now, 1.2); 
    }
  }, [isPlaying, muted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(!muted);
    if (!userInteracted) setUserInteracted(true);
  };

  const getPresetInfo = () => {
    switch(preset) {
        case AudioPreset.AWAKENING: return { label: 'Awakening 963Hz', icon: <Zap size={10} /> };
        case AudioPreset.LOVE: return { label: 'Love 528Hz', icon: <Heart size={10} /> };
        case AudioPreset.INTUITION: return { label: 'Intuition 852Hz', icon: <Waves size={10} /> };
        case AudioPreset.GROUNDING: return { label: 'Schumann 7.83Hz', icon: <Sparkles size={10} /> };
        case AudioPreset.FOCUS: return { label: 'Alpha 10Hz', icon: <Brain size={10} /> };
        default: return { label: 'Resonance 432Hz', icon: <Sparkles size={10} /> };
    }
  };

  const info = getPresetInfo();

  return (
    <div className="fixed bottom-20 sm:bottom-32 right-4 sm:right-6 sm:right-10 z-50 animate-in fade-in duration-1000 flex flex-col items-end gap-1.5 sm:gap-2">
      {!userInteracted && isPlaying && !muted && (
        <div className="flex items-center gap-2 text-[10px] text-cyan-400/70 font-mono animate-pulse bg-black/40 px-3 py-1.5 rounded-full border border-cyan-900/30 backdrop-blur-sm cursor-pointer" onClick={() => document.body.click()}>
          <Sparkles size={10} />
          <span className="hidden sm:inline">INITIALIZE ENERGY FIELD</span>
          <span className="sm:hidden">INIT</span>
        </div>
      )}

      <button 
        onClick={toggleMute}
        className={`relative p-2 sm:p-3 rounded-full border backdrop-blur-md transition-all duration-500 group ${
          muted 
            ? 'bg-black/40 border-white/10 text-white/30 hover:bg-white/10 hover:text-white' 
            : 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]'
        }`}
      >
        {muted ? <VolumeX size={14} className="sm:w-[18px] sm:h-[18px]" /> : <Volume2 size={14} className="sm:w-[18px] sm:h-[18px]" />}
        {!muted && isPlaying && userInteracted && (
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex gap-0.5 h-2 sm:h-3 items-end">
            <div className="w-0.5 animate-[bounce_1s_infinite] h-full bg-cyan-400" />
            <div className="w-0.5 animate-[bounce_1.2s_infinite] h-2/3 bg-cyan-400" />
            <div className="w-0.5 animate-[bounce_0.8s_infinite] h-1/2 bg-cyan-400" />
          </div>
        )}
      </button>
      
      {!muted && isPlaying && (
        <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-mono text-white/30 uppercase tracking-widest pr-0.5 sm:pr-1">
            <span className="scale-75 sm:scale-100">{info.icon}</span>
            <span className="hidden sm:inline">{info.label}</span>
            <span className="sm:hidden text-[7px]">{info.label.split(' ')[0]}</span>
        </div>
      )}
    </div>
  );
};
