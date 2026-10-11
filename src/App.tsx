import React, { useState } from 'react';
import { DigitalClockView } from './components/DigitalClockView';
import { soundEngine } from './utils/audio';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [deviceMode, setDeviceMode] = useState<'fullscreen' | 'iphone'>('fullscreen');

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Viewport Container */}
      <main className="flex-1 flex flex-col items-center justify-center w-full h-full">
        {deviceMode === 'iphone' ? (
          /* iPhone Digital Device Frame */
          <div className="relative w-full max-w-[420px] h-[780px] bg-black rounded-[50px] border-[10px] border-zinc-800 shadow-[0_0_80px_-20px_rgba(0,0,0,0.95)] ring-1 ring-zinc-700/60 flex flex-col overflow-hidden my-4">
            {/* Dynamic Island */}
            <div className="pt-3 px-8 pb-1 flex items-center justify-center z-30 bg-black select-none">
              <div className="w-24 h-6 bg-black rounded-full border border-zinc-850 flex items-center justify-center px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 mr-2" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>
            </div>

            {/* Screen Viewport with Digital Clock */}
            <div className="flex-1 flex flex-col bg-black overflow-hidden">
              <DigitalClockView />
            </div>

            {/* Home Indicator */}
            <div className="w-full pb-2 pt-1 flex justify-center bg-black">
              <div className="w-32 h-1 bg-zinc-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Pure Fullscreen Digital Clock (Default) */
          <div className="w-full h-screen flex flex-col">
            <DigitalClockView />
          </div>
        )}
      </main>

      {/* Floating View Switcher (Discreet Bottom Right) */}
      <div className="fixed bottom-3 right-3 z-30 flex items-center gap-1 p-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <button
          onClick={() => {
            soundEngine.playHaptic();
            setDeviceMode('fullscreen');
          }}
          className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
            deviceMode === 'fullscreen'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Fullscreen Digital Clock"
        >
          <Monitor size={15} />
        </button>
        <button
          onClick={() => {
            soundEngine.playHaptic();
            setDeviceMode('iphone');
          }}
          className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
            deviceMode === 'iphone'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="iPhone Frame Digital Clock"
        >
          <Smartphone size={15} />
        </button>
      </div>
    </div>
  );
}
