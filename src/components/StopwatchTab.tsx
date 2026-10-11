import React, { useState, useEffect, useRef } from 'react';
import { Lap } from '../types/clock';
import { soundEngine } from '../utils/audio';
import { Play, Pause, RotateCcw, Flag, Timer as TimerIcon } from 'lucide-react';

export const StopwatchTab: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [activeTabMode, setActiveTabMode] = useState<'digital' | 'analog'>('analog');

  const startTimestampRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastLapDurationRef = useRef<number>(0);

  // High precision rAF loop
  const updateLoop = () => {
    const now = performance.now();
    const currentElapsed = accumulatedMsRef.current + (now - startTimestampRef.current);
    setElapsedMs(currentElapsed);
    animationFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const handleStart = () => {
    soundEngine.playHaptic();
    setIsRunning(true);
    startTimestampRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const handleStop = () => {
    soundEngine.playHaptic();
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const now = performance.now();
    accumulatedMsRef.current += now - startTimestampRef.current;
    setElapsedMs(accumulatedMsRef.current);
  };

  const handleReset = () => {
    soundEngine.playHaptic();
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    startTimestampRef.current = 0;
    accumulatedMsRef.current = 0;
    lastLapDurationRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    soundEngine.playLap();
    const currentLapTime = elapsedMs - lastLapDurationRef.current;
    lastLapDurationRef.current = elapsedMs;

    const newLap: Lap = {
      id: Date.now().toString(),
      lapNumber: laps.length + 1,
      lapTimeMs: currentLapTime,
      overallTimeMs: elapsedMs,
    };

    const updatedLaps = [newLap, ...laps];

    // Compute fastest and slowest if >= 2 laps
    if (updatedLaps.length >= 2) {
      let minLap = updatedLaps[0];
      let maxLap = updatedLaps[0];

      updatedLaps.forEach((l) => {
        if (l.lapTimeMs < minLap.lapTimeMs) minLap = l;
        if (l.lapTimeMs > maxLap.lapTimeMs) maxLap = l;
      });

      updatedLaps.forEach((l) => {
        l.isFastest = l.id === minLap.id;
        l.isSlowest = l.id === maxLap.id;
      });
    }

    setLaps(updatedLaps);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const formatStopwatchTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);

    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      hundredths: String(hundredths).padStart(2, '0'),
    };
  };

  const timeFormatted = formatStopwatchTime(elapsedMs);

  // Analog Chronograph Hand Angles
  const totalSecondsExact = elapsedMs / 1000;
  const secondHandAngle = (totalSecondsExact % 60) * 6; // 360 / 60
  const minuteSubdialAngle = ((totalSecondsExact / 60) % 30) * 12; // 360 / 30

  // Current lap split time
  const currentSplitMs = elapsedMs - lastLapDurationRef.current;
  const currentSplitFormatted = formatStopwatchTime(currentSplitMs);

  // Statistics
  const avgLapMs =
    laps.length > 0
      ? laps.reduce((acc, l) => acc + l.lapTimeMs, 0) / laps.length
      : 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* View Switcher: Analog vs Digital */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Stopwatch
          </h2>
          <div className="text-xs text-zinc-400 mt-0.5">
            ContinuousClock precision with lap splits
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => {
              soundEngine.playHaptic();
              setActiveTabMode('analog');
            }}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTabMode === 'analog'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Chronograph
          </button>
          <button
            onClick={() => {
              soundEngine.playHaptic();
              setActiveTabMode('digital');
            }}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTabMode === 'digital'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Digital
          </button>
        </div>
      </div>

      {/* Main Display: Analog or Digital */}
      <div className="flex flex-col items-center justify-center py-2">
        {activeTabMode === 'analog' ? (
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-xl"
            >
              {/* Dial Background */}
              <circle
                cx="100"
                cy="100"
                r="96"
                fill="#0A0A0C"
                stroke="#27272A"
                strokeWidth="2"
              />

              {/* 30-Minute Subdial at top */}
              <g transform="translate(100, 62)">
                <circle cx="0" cy="0" r="26" fill="#141418" stroke="#3F3F46" strokeWidth="1" />
                {/* 30 ticks */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const deg = i * 60;
                  const rad = (deg - 90) * (Math.PI / 180);
                  return (
                    <text
                      key={i}
                      x={20 * Math.cos(rad)}
                      y={20 * Math.sin(rad)}
                      fill="#71717A"
                      fontSize="6"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {i * 5}
                    </text>
                  );
                })}
                {/* Subdial hand */}
                <g transform={`rotate(${minuteSubdialAngle})`}>
                  <line
                    x1="0"
                    y1="4"
                    x2="0"
                    y2="-21"
                    stroke="#FF9F0A"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="2.5" fill="#FF9F0A" />
                </g>
              </g>

              {/* 60 Seconds Dial Markers */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angleDeg = i * 6;
                const angleRad = (angleDeg - 90) * (Math.PI / 180);
                const isMajor = i % 5 === 0;
                const rOuter = 92;
                const rInner = isMajor ? 82 : 87;

                return (
                  <line
                    key={i}
                    x1={100 + rOuter * Math.cos(angleRad)}
                    y1={100 + rOuter * Math.sin(angleRad)}
                    x2={100 + rInner * Math.cos(angleRad)}
                    y2={100 + rInner * Math.sin(angleRad)}
                    stroke={isMajor ? '#E4E4E7' : '#52525B'}
                    strokeWidth={isMajor ? 2 : 1}
                  />
                );
              })}

              {/* Major Second Numbers (5, 10, 15, ..., 60) */}
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((num) => {
                const deg = num * 6;
                const rad = (deg - 90) * (Math.PI / 180);
                return (
                  <text
                    key={num}
                    x={100 + 74 * Math.cos(rad)}
                    y={100 + 74 * Math.sin(rad)}
                    fill="#A1A1AA"
                    fontSize="8"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {num === 60 ? '0' : num}
                  </text>
                );
              })}

              {/* Digital Inset Readout */}
              <text
                x="100"
                y="138"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="700"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {timeFormatted.minutes}:{timeFormatted.seconds}.{timeFormatted.hundredths}
              </text>

              {/* Main Orange Chronograph Second Hand */}
              <g transform={`rotate(${secondHandAngle}, 100, 100)`}>
                {/* Counterweight */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="120"
                  stroke="#FF9F0A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Long Pointer */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="15"
                  stroke="#FF9F0A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* Center Pin */}
                <circle cx="100" cy="100" r="4" fill="#FF9F0A" />
                <circle cx="100" cy="100" r="1.5" fill="#0A0A0C" />
              </g>
            </svg>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-6xl sm:text-7xl font-extralight text-white font-mono tracking-tight tabular-nums select-none">
              <span>{timeFormatted.minutes}:</span>
              <span>{timeFormatted.seconds}</span>
              <span className="text-4xl sm:text-5xl text-zinc-500 font-normal">
                .{timeFormatted.hundredths}
              </span>
            </div>

            {laps.length > 0 && (
              <div className="mt-2 text-xs text-zinc-400 font-mono">
                Current Lap: {currentSplitFormatted.minutes}:
                {currentSplitFormatted.seconds}.{currentSplitFormatted.hundredths}
              </div>
            )}
          </div>
        )}

        {/* Buttons (Lap / Reset on left, Start / Stop on right) */}
        <div className="flex items-center justify-between w-full max-w-sm px-6 pt-2">
          {/* Left Button (Lap or Reset) */}
          <button
            onClick={isRunning ? handleLap : handleReset}
            disabled={!isRunning && elapsedMs === 0}
            className={`w-18 h-18 rounded-full border-2 text-sm font-medium transition-all duration-150 cursor-pointer flex flex-col items-center justify-center shadow-lg active:scale-95 ${
              !isRunning && elapsedMs === 0
                ? 'border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                : 'border-zinc-700 bg-zinc-800/80 text-white hover:bg-zinc-750'
            }`}
          >
            {isRunning ? (
              <>
                <Flag size={18} className="mb-0.5" />
                <span>Lap</span>
              </>
            ) : (
              <>
                <RotateCcw size={18} className="mb-0.5" />
                <span>Reset</span>
              </>
            )}
          </button>

          {/* Right Button (Start or Stop) */}
          <button
            onClick={isRunning ? handleStop : handleStart}
            className={`w-18 h-18 rounded-full border-2 text-sm font-semibold transition-all duration-150 cursor-pointer flex flex-col items-center justify-center shadow-lg active:scale-95 ${
              isRunning
                ? 'border-red-600/60 bg-red-950/70 text-red-400 hover:bg-red-900/80'
                : 'border-emerald-600/60 bg-emerald-950/70 text-emerald-400 hover:bg-emerald-900/80'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={18} className="mb-0.5" />
                <span>Stop</span>
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

      {/* Lap Stats Bar */}
      {laps.length > 0 && (
        <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center text-xs">
          <div>
            <div className="text-zinc-500">Laps</div>
            <div className="font-semibold text-white font-mono">{laps.length}</div>
          </div>
          <div>
            <div className="text-zinc-500">Avg Lap</div>
            <div className="font-semibold text-zinc-300 font-mono">
              {formatStopwatchTime(avgLapMs).seconds}.{formatStopwatchTime(avgLapMs).hundredths}s
            </div>
          </div>
          <div>
            <div className="text-zinc-500">Total Time</div>
            <div className="font-semibold text-amber-400 font-mono">
              {timeFormatted.minutes}:{timeFormatted.seconds}
            </div>
          </div>
        </div>
      )}

      {/* Laps List */}
      <div className="flex-1 overflow-y-auto pr-1">
        {laps.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs flex flex-col items-center gap-1.5">
            <TimerIcon size={20} className="text-zinc-600" />
            <span>Recorded lap times will appear here.</span>
          </div>
        ) : (
          <div className="divide-y divide-zinc-850">
            {laps.map((lap) => {
              const lapTime = formatStopwatchTime(lap.lapTimeMs);
              const overallTime = formatStopwatchTime(lap.overallTimeMs);

              let lapColorClass = 'text-white';
              if (lap.isFastest) lapColorClass = 'text-emerald-400 font-bold';
              if (lap.isSlowest) lapColorClass = 'text-red-400 font-bold';

              return (
                <div
                  key={lap.id}
                  className="flex items-center justify-between py-2.5 px-3 text-sm font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-medium">
                      Lap {lap.lapNumber}
                    </span>
                    {lap.isFastest && (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                        Fastest
                      </span>
                    )}
                    {lap.isSlowest && (
                      <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                        Slowest
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <span className={`tabular-nums ${lapColorClass}`}>
                      {lapTime.minutes}:{lapTime.seconds}.{lapTime.hundredths}
                    </span>
                    <span className="text-xs text-zinc-500 tabular-nums">
                      {overallTime.minutes}:{overallTime.seconds}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
