import React, { useState, useEffect } from 'react';
import { WatchFaceTheme } from '../types/clock';
import { AnalogClock } from './AnalogClock';
import { soundEngine } from '../utils/audio';
import { Volume2, VolumeX, Maximize2, Sparkles, Moon } from 'lucide-react';

interface WatchFaceTabProps {
  currentTime: Date;
}

const THEMES: { id: WatchFaceTheme; label: string; desc: string }[] = [
  { id: 'cupertino', label: 'Cupertino Classic', desc: 'Signature Apple Watch dial' },
  { id: 'chronograph', label: 'Chronograph Pro', desc: 'Precision dual subdials' },
  { id: 'california', label: 'California Dial', desc: 'Roman & Arabic typography' },
  { id: 'oled', label: 'OLED Stealth', desc: 'Deep cyan minimal glow' },
  { id: 'bauhaus', label: 'Bauhaus Minimal', desc: 'Geometric Swiss purity' },
  { id: 'digital', label: 'Big Digital', desc: 'Monolithic digital typography' },
];

export const WatchFaceTab: React.FC<WatchFaceTabProps> = ({ currentTime }) => {
  const [selectedTheme, setSelectedTheme] = useState<WatchFaceTheme>('cupertino');
  const [smoothSeconds, setSmoothSeconds] = useState(true);
  const [tickSoundEnabled, setTickSoundEnabled] = useState(false);

  // Play tick sound every second if enabled
  useEffect(() => {
    if (!tickSoundEnabled) return;
    const interval = setInterval(() => {
      soundEngine.playTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickSoundEnabled]);

  const hoursStr = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const secondsStr = String(currentTime.getSeconds()).padStart(2, '0');
  const dateStr = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Nightstand & Watch Faces
          </h2>
          <div className="text-xs text-zinc-400 mt-0.5">
            Ambient clock faces rendered with high-fidelity vector graphics
          </div>
        </div>

        {/* Audio / Seconds toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playHaptic();
              setTickSoundEnabled(!tickSoundEnabled);
            }}
            className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              tickSoundEnabled
                ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Toggle mechanical tick sound"
          >
            {tickSoundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="hidden sm:inline">Tick Sound</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playHaptic();
              setSmoothSeconds(!smoothSeconds);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              smoothSeconds
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {smoothSeconds ? 'Sweep Seconds' : 'Step Seconds'}
          </button>
        </div>
      </div>

      {/* Main Clock Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 bg-zinc-950/70 border border-zinc-850 rounded-3xl relative overflow-hidden shadow-inner">
        {/* Subtle Ambient Glow behind dial */}
        <div className="absolute w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        {selectedTheme === 'digital' ? (
          // Monolithic Digital Clock
          <div className="text-center z-10 space-y-2 select-none">
            <div className="text-xs font-semibold text-amber-400 tracking-widest uppercase">
              {dateStr}
            </div>

            <div className="flex items-baseline justify-center">
              <span className="text-7xl sm:text-8xl font-thin text-white font-mono tracking-tight tabular-nums">
                {hoursStr.split(' ')[0]}
              </span>
              <span className="text-3xl sm:text-4xl font-light text-amber-500 font-mono ml-2 tabular-nums">
                :{secondsStr}
              </span>
            </div>

            <div className="text-sm font-semibold text-zinc-500 tracking-widest uppercase">
              {hoursStr.split(' ')[1]} · Cupertino, CA
            </div>
          </div>
        ) : (
          // Vector Analog Clock
          <div className="z-10 flex flex-col items-center gap-4">
            <AnalogClock
              time={currentTime}
              size={260}
              theme={selectedTheme}
              smoothSeconds={smoothSeconds}
            />

            <div className="text-center">
              <div className="text-sm font-medium text-white">{dateStr}</div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">
                {hoursStr} · Continuous Time
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme Selector Carousel */}
      <div>
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>Select Watch Face Style</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {THEMES.map((th) => {
            const isSelected = selectedTheme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => {
                  soundEngine.playHaptic();
                  setSelectedTheme(th.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-amber-400' : 'text-zinc-200'
                  }`}
                >
                  {th.label}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 leading-tight">
                  {th.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
