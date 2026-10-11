import React, { useState, useEffect, useRef } from 'react';
import { TimerPreset } from '../types/clock';
import { soundEngine } from '../utils/audio';
import { Play, Pause, X, Bell, RotateCcw, Sparkles } from 'lucide-react';

const TIMER_PRESETS: TimerPreset[] = [
  { id: '1', label: 'Espresso', seconds: 30, category: 'Kitchen' },
  { id: '2', label: 'Tea Brew', seconds: 180, category: 'Kitchen' },
  { id: '3', label: 'Boil Eggs', seconds: 480, category: 'Kitchen' },
  { id: '4', label: 'Power Nap', seconds: 1200, category: 'Rest' },
  { id: '5', label: 'Pomodoro', seconds: 1500, category: 'Focus' },
  { id: '6', label: 'Swift Sprint', seconds: 2700, category: 'Work' },
];

export const TimerTab: React.FC = () => {
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [selectedSeconds, setSelectedSeconds] = useState(0);

  const [totalDurationSeconds, setTotalDurationSeconds] = useState(900); // 15 mins
  const [remainingSeconds, setRemainingSeconds] = useState(900);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerIntervalRef = useRef<number | null>(null);

  // Countdown timer loop
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            soundEngine.playSound('timer');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds]);

  // Repeated chime when completed
  useEffect(() => {
    if (!isCompleted) return;
    const interval = setInterval(() => {
      soundEngine.playSound('timer');
    }, 2500);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const handleStart = () => {
    soundEngine.playHaptic();
    const total = selectedHours * 3600 + selectedMinutes * 60 + selectedSeconds;
    if (total <= 0) return;

    if (remainingSeconds === 0 || remainingSeconds === totalDurationSeconds) {
      setTotalDurationSeconds(total);
      setRemainingSeconds(total);
    }
    setIsCompleted(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    soundEngine.playHaptic();
    setIsRunning(false);
  };

  const handleCancel = () => {
    soundEngine.playHaptic();
    setIsRunning(false);
    setIsCompleted(false);
    const initialTotal = selectedHours * 3600 + selectedMinutes * 60 + selectedSeconds;
    setRemainingSeconds(initialTotal > 0 ? initialTotal : 900);
  };

  const applyPreset = (preset: TimerPreset) => {
    soundEngine.playHaptic();
    setIsRunning(false);
    setIsCompleted(false);

    const h = Math.floor(preset.seconds / 3600);
    const m = Math.floor((preset.seconds % 3600) / 60);
    const s = preset.seconds % 60;

    setSelectedHours(h);
    setSelectedMinutes(m);
    setSelectedSeconds(s);

    setTotalDurationSeconds(preset.seconds);
    setRemainingSeconds(preset.seconds);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Progress fraction (0 to 1)
  const progressFraction =
    totalDurationSeconds > 0
      ? (totalDurationSeconds - remainingSeconds) / totalDurationSeconds
      : 0;

  // Ring geometry
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressFraction);

  // Projected finish time
  const finishDate = new Date(Date.now() + remainingSeconds * 1000);
  const finishTimeText = finishDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Timer
          </h2>
          <div className="text-xs text-zinc-400 mt-0.5">
            Radial animated countdown with audio completion chime
          </div>
        </div>

        {isRunning && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Bell size={12} />
            <span>Ends at {finishTimeText}</span>
          </div>
        )}
      </div>

      {/* Main View: Ring or Wheel Pickers */}
      <div className="flex flex-col items-center justify-center flex-1 py-2">
        {isRunning || remainingSeconds !== totalDurationSeconds ? (
          // Active Circular Timer Ring
          <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background track */}
              <circle
                cx="128"
                cy="128"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="128"
                cy="128"
                r={radius}
                className="stroke-amber-500 transition-all duration-300 ease-linear"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inset Text Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-extralight text-white font-mono tracking-tight tabular-nums">
                {formatTime(remainingSeconds)}
              </span>

              <span className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
                <Bell size={12} className="text-amber-500" />
                {finishTimeText}
              </span>
            </div>
          </div>
        ) : (
          // Time Pickers (Hours, Minutes, Seconds)
          <div className="flex items-center justify-center gap-4 py-8 bg-zinc-950/40 border border-zinc-850 rounded-3xl px-8 w-full max-w-sm">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <select
                value={selectedHours}
                onChange={(e) => {
                  setSelectedHours(parseInt(e.target.value));
                  const total =
                    parseInt(e.target.value) * 3600 + selectedMinutes * 60 + selectedSeconds;
                  setTotalDurationSeconds(total);
                  setRemainingSeconds(total);
                }}
                className="bg-zinc-900 border border-zinc-750 text-white text-3xl font-mono p-2.5 rounded-xl cursor-pointer focus:outline-none focus:border-amber-500"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i} className="bg-zinc-900 text-white">
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-500 mt-2 font-medium uppercase">Hours</span>
            </div>

            <span className="text-2xl font-light text-zinc-500 mb-6">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <select
                value={selectedMinutes}
                onChange={(e) => {
                  setSelectedMinutes(parseInt(e.target.value));
                  const total =
                    selectedHours * 3600 + parseInt(e.target.value) * 60 + selectedSeconds;
                  setTotalDurationSeconds(total);
                  setRemainingSeconds(total);
                }}
                className="bg-zinc-900 border border-zinc-750 text-white text-3xl font-mono p-2.5 rounded-xl cursor-pointer focus:outline-none focus:border-amber-500"
              >
                {Array.from({ length: 60 }).map((_, i) => (
                  <option key={i} value={i} className="bg-zinc-900 text-white">
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-500 mt-2 font-medium uppercase">Mins</span>
            </div>

            <span className="text-2xl font-light text-zinc-500 mb-6">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <select
                value={selectedSeconds}
                onChange={(e) => {
                  setSelectedSeconds(parseInt(e.target.value));
                  const total =
                    selectedHours * 3600 + selectedMinutes * 60 + parseInt(e.target.value);
                  setTotalDurationSeconds(total);
                  setRemainingSeconds(total);
                }}
                className="bg-zinc-900 border border-zinc-750 text-white text-3xl font-mono p-2.5 rounded-xl cursor-pointer focus:outline-none focus:border-amber-500"
              >
                {Array.from({ length: 60 }).map((_, i) => (
                  <option key={i} value={i} className="bg-zinc-900 text-white">
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-500 mt-2 font-medium uppercase">Secs</span>
            </div>
          </div>
        )}

        {/* Controls: Cancel / Start / Pause */}
        <div className="flex items-center justify-between w-full max-w-sm px-6 pt-6">
          <button
            onClick={handleCancel}
            disabled={!isRunning && remainingSeconds === totalDurationSeconds}
            className={`w-18 h-18 rounded-full border-2 text-sm font-medium transition-all duration-150 cursor-pointer flex flex-col items-center justify-center shadow-lg active:scale-95 ${
              !isRunning && remainingSeconds === totalDurationSeconds
                ? 'border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                : 'border-zinc-700 bg-zinc-800/80 text-white hover:bg-zinc-750'
            }`}
          >
            <X size={18} className="mb-0.5" />
            <span>Cancel</span>
          </button>

          <button
            onClick={isRunning ? handlePause : handleStart}
            className={`w-18 h-18 rounded-full border-2 text-sm font-semibold transition-all duration-150 cursor-pointer flex flex-col items-center justify-center shadow-lg active:scale-95 ${
              isRunning
                ? 'border-amber-500/60 bg-amber-950/70 text-amber-400 hover:bg-amber-900/80'
                : 'border-emerald-600/60 bg-emerald-950/70 text-emerald-400 hover:bg-emerald-900/80'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={18} className="mb-0.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={18} className="mb-0.5 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="pt-2">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>Quick Presets</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TIMER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="text-xs font-medium text-white group-hover:text-amber-400">
                {preset.label}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                {formatTime(preset.seconds)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Timer Finished Alert Overlay */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-pulse">
          <div className="bg-zinc-900 border-2 border-amber-500 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell size={36} className="animate-bounce" />
            </div>

            <div>
              <div className="text-3xl font-bold text-white">Timer Complete!</div>
              <div className="text-sm text-zinc-400 mt-1">
                Your countdown of {formatTime(totalDurationSeconds)} has elapsed.
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playHaptic();
                setIsCompleted(false);
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
