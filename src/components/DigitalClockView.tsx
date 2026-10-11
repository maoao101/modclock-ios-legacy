import React, { useState, useEffect } from 'react';
import { SevenSegmentDigit, SevenSegmentColon } from './SevenSegmentDigit';
import { soundEngine } from '../utils/audio';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Code2,
  Sparkles,
  Globe,
  Copy,
  Check,
  X,
} from 'lucide-react';

export type DigitalStyle = 'modern' | 'led' | 'mono' | 'minimal';

export interface ColorTheme {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  bgColor: string;
  inactiveLed: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'orange',
    name: 'Cupertino Orange',
    color: '#FF9F0A',
    glowColor: 'rgba(255, 159, 10, 0.35)',
    bgColor: '#070709',
    inactiveLed: 'rgba(255, 159, 10, 0.08)',
  },
  {
    id: 'white',
    name: 'OLED White',
    color: '#FFFFFF',
    glowColor: 'rgba(255, 255, 255, 0.25)',
    bgColor: '#000000',
    inactiveLed: 'rgba(255, 255, 255, 0.07)',
  },
  {
    id: 'emerald',
    name: 'Phosphor Green',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    bgColor: '#020C08',
    inactiveLed: 'rgba(16, 185, 129, 0.08)',
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    bgColor: '#030C12',
    inactiveLed: 'rgba(6, 182, 212, 0.08)',
  },
  {
    id: 'red',
    name: 'Nightstand Red',
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    bgColor: '#0C0202',
    inactiveLed: 'rgba(239, 68, 68, 0.08)',
  },
  {
    id: 'gold',
    name: 'Solar Amber',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    bgColor: '#080602',
    inactiveLed: 'rgba(245, 158, 11, 0.08)',
  },
];

const TIMEZONES = [
  { id: 'local', name: 'Local Device Time', tz: '' },
  { id: 'cupertino', name: 'Cupertino (PT)', tz: 'America/Los_Angeles' },
  { id: 'new-york', name: 'New York (ET)', tz: 'America/New_York' },
  { id: 'london', name: 'London (GMT)', tz: 'Europe/London' },
  { id: 'paris', name: 'Paris (CET)', tz: 'Europe/Paris' },
  { id: 'tokyo', name: 'Tokyo (JST)', tz: 'Asia/Tokyo' },
  { id: 'sydney', name: 'Sydney (AEST)', tz: 'Australia/Sydney' },
];

export const DigitalClockView: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(true);
  const [showSeconds, setShowSeconds] = useState<boolean>(true);
  const [blinkColon, setBlinkColon] = useState<boolean>(false);
  const [digitalStyle, setDigitalStyle] = useState<DigitalStyle>('modern');
  const [theme, setTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [selectedTz, setSelectedTz] = useState<string>('local');
  const [hourlyChime, setHourlyChime] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSwiftModal, setShowSwiftModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Time loop
  useEffect(() => {
    let animId: number;
    let lastSecond = -1;

    const tick = () => {
      const now = new Date();
      setTime(now);

      // Hourly chime check
      if (hourlyChime) {
        const sec = now.getSeconds();
        const min = now.getMinutes();
        if (min === 0 && sec === 0 && lastSecond !== 0) {
          soundEngine.playSound('chimes');
        }
        lastSecond = sec;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [hourlyChime]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    soundEngine.playHaptic();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Compute displayed time in selected timezone
  const getTimeInTz = (): Date => {
    const tzObj = TIMEZONES.find((t) => t.id === selectedTz);
    if (!tzObj || !tzObj.tz) return time;
    try {
      const str = time.toLocaleString('en-US', { timeZone: tzObj.tz });
      return new Date(str);
    } catch {
      return time;
    }
  };

  const displayDate = getTimeInTz();
  let hours = displayDate.getHours();
  const minutes = displayDate.getMinutes();
  const seconds = displayDate.getSeconds();
  const milliseconds = displayDate.getMilliseconds();

  let ampm = '';
  if (!is24Hour) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
  }

  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');

  const colonVisible = blinkColon ? milliseconds < 500 : true;

  const dateFormatted = displayDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const activeTzLabel =
    TIMEZONES.find((t) => t.id === selectedTz)?.name || 'Local Time';

  // Swift 6 code representation
  const swiftCodeSnippet = `import SwiftUI

/// Pure Digital Clock in Swift 6 & SwiftUI
struct DigitalClockView: View {
    @State private var currentDate = Date()
    @State private var is24HourFormat = ${is24Hour}
    @State private var showSeconds = ${showSeconds}
    let timer = Timer.publish(every: 0.1, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 12) {
            // Formatted Date
            Text(currentDate, format: .dateTime.weekday(.wide).month().day().year())
                .font(.title3.weight(.medium))
                .foregroundStyle(.secondary)
                .tracking(1.5)

            // Pure Digital Readout
            HStack(alignment: .lastTextBaseline, spacing: 6) {
                Text(formattedTimeString)
                    .font(.system(size: 96, weight: .thin, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(Color(hex: "${theme.color}"))

                if !is24HourFormat {
                    Text(currentDate, format: .dateTime.hour(.conversationalDefaultDigits(amPM: .wide)))
                        .font(.title2.weight(.bold))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black.ignoresSafeArea())
        .onReceive(timer) { input in
            currentDate = input
        }
    }

    private var formattedTimeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = is24HourFormat ? "HH:mm:ss" : "hh:mm:ss"
        return formatter.string(from: currentDate)
    }
}
`;

  const copySwiftCode = () => {
    soundEngine.playHaptic();
    navigator.clipboard.writeText(swiftCodeSnippet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className="relative flex-1 w-full flex flex-col justify-between transition-colors duration-500 overflow-hidden select-none"
      style={{ backgroundColor: theme.bgColor }}
    >
      {/* Background Subtle Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${theme.glowColor} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {/* Top Header Control Toolbar */}
      <div className="relative z-10 w-full max-w-5xl mx-auto pt-4 px-4 flex flex-wrap items-center justify-between gap-3">
        {/* Timezone Selector (pure digital) */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
          <Globe size={14} className="text-zinc-400" />
          <select
            value={selectedTz}
            onChange={(e) => {
              soundEngine.playHaptic();
              setSelectedTz(e.target.value);
            }}
            className="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer pr-1"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.id} value={tz.id} className="bg-zinc-900 text-white">
                {tz.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Toggles: 12h/24h, Seconds, Blinking, Fullscreen, Swift */}
        <div className="flex items-center gap-2">
          {/* 12h / 24h Toggle */}
          <button
            onClick={() => {
              soundEngine.playHaptic();
              setIs24Hour(!is24Hour);
            }}
            className="px-2.5 py-1 bg-black/40 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle 12-hour or 24-hour mode"
          >
            {is24Hour ? '24H' : '12H'}
          </button>

          {/* Seconds Toggle */}
          <button
            onClick={() => {
              soundEngine.playHaptic();
              setShowSeconds(!showSeconds);
            }}
            className={`px-2.5 py-1 bg-black/40 hover:bg-white/10 backdrop-blur-md border rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              showSeconds
                ? 'border-white/20 text-white'
                : 'border-white/5 text-zinc-500'
            }`}
            title="Show or hide seconds"
          >
            :SEC
          </button>

          {/* Blinking Colon Toggle */}
          <button
            onClick={() => {
              soundEngine.playHaptic();
              setBlinkColon(!blinkColon);
            }}
            className={`px-2.5 py-1 bg-black/40 hover:bg-white/10 backdrop-blur-md border rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              blinkColon
                ? 'border-white/20 text-white'
                : 'border-white/5 text-zinc-500'
            }`}
            title="Blinking separator"
          >
            BLINK
          </button>

          {/* Chime On The Hour */}
          <button
            onClick={() => {
              soundEngine.playHaptic();
              setHourlyChime(!hourlyChime);
            }}
            className={`p-1.5 bg-black/40 hover:bg-white/10 backdrop-blur-md border rounded-xl transition-colors cursor-pointer ${
              hourlyChime
                ? 'border-white/20 text-white'
                : 'border-white/5 text-zinc-500 hover:text-zinc-400'
            }`}
            title="Hourly chime bell"
          >
            {hourlyChime ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-black/40 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle fullscreen (or press F)"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Swift Code Inspector Button */}
          <button
            onClick={() => {
              soundEngine.playHaptic();
              setShowSwiftModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-xl text-xs font-medium text-amber-400 transition-colors cursor-pointer"
            title="View Swift 6 Digital Clock source code"
          >
            <Code2 size={13} />
            <span>Swift</span>
          </button>
        </div>
      </div>

      {/* Main Digital Clock Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        {/* Digital Date and Region Header */}
        <div className="mb-4 sm:mb-8 space-y-1">
          <div
            className="text-sm sm:text-lg font-medium tracking-widest uppercase transition-colors"
            style={{ color: theme.color, opacity: 0.8 }}
          >
            {dateFormatted}
          </div>
          <div className="text-xs text-zinc-500 font-mono tracking-wider">
            {activeTzLabel}
          </div>
        </div>

        {/* Digital Time Readout */}
        <div className="flex items-center justify-center">
          {digitalStyle === 'led' ? (
            /* Authentic 7-Segment LED Display */
            <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 p-4 sm:p-8 rounded-3xl bg-black/70 border border-white/5 shadow-2xl">
              {/* Hours */}
              <div className="flex items-center gap-1 sm:gap-2">
                <SevenSegmentDigit
                  char={hoursStr[0]}
                  color={theme.color}
                  inactiveColor={theme.inactiveLed}
                  size={58}
                />
                <SevenSegmentDigit
                  char={hoursStr[1]}
                  color={theme.color}
                  inactiveColor={theme.inactiveLed}
                  size={58}
                />
              </div>

              {/* Colon */}
              <SevenSegmentColon
                color={colonVisible ? theme.color : theme.inactiveLed}
                size={22}
              />

              {/* Minutes */}
              <div className="flex items-center gap-1 sm:gap-2">
                <SevenSegmentDigit
                  char={minutesStr[0]}
                  color={theme.color}
                  inactiveColor={theme.inactiveLed}
                  size={58}
                />
                <SevenSegmentDigit
                  char={minutesStr[1]}
                  color={theme.color}
                  inactiveColor={theme.inactiveLed}
                  size={58}
                />
              </div>

              {/* Seconds (optional) */}
              {showSeconds && (
                <>
                  <SevenSegmentColon
                    color={colonVisible ? theme.color : theme.inactiveLed}
                    size={22}
                  />
                  <div className="flex items-center gap-1 sm:gap-2">
                    <SevenSegmentDigit
                      char={secondsStr[0]}
                      color={theme.color}
                      inactiveColor={theme.inactiveLed}
                      size={58}
                    />
                    <SevenSegmentDigit
                      char={secondsStr[1]}
                      color={theme.color}
                      inactiveColor={theme.inactiveLed}
                      size={58}
                    />
                  </div>
                </>
              )}

              {/* AM / PM indicator */}
              {!is24Hour && (
                <div className="ml-3 flex flex-col justify-between py-2 text-xs font-mono font-bold tracking-wider">
                  <span
                    className={
                      ampm === 'AM'
                        ? 'transition-colors'
                        : 'text-zinc-800'
                    }
                    style={{ color: ampm === 'AM' ? theme.color : undefined }}
                  >
                    AM
                  </span>
                  <span
                    className={
                      ampm === 'PM'
                        ? 'transition-colors'
                        : 'text-zinc-800'
                    }
                    style={{ color: ampm === 'PM' ? theme.color : undefined }}
                  >
                    PM
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Modern, Monospace, or Minimal Digital Typography */
            <div
              className={`flex items-baseline justify-center select-none font-mono tracking-tight tabular-nums ${
                digitalStyle === 'minimal'
                  ? 'font-extralight'
                  : digitalStyle === 'mono'
                  ? 'font-mono font-bold'
                  : 'font-light'
              }`}
              style={{
                color: theme.color,
                textShadow: `0 0 35px ${theme.glowColor}`,
              }}
            >
              {/* Hours */}
              <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none">
                {hoursStr}
              </span>

              {/* Colon */}
              <span
                className={`text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] px-1 sm:px-2 leading-none transition-opacity duration-150 ${
                  colonVisible ? 'opacity-100' : 'opacity-10'
                }`}
              >
                :
              </span>

              {/* Minutes */}
              <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none">
                {minutesStr}
              </span>

              {/* Seconds */}
              {showSeconds && (
                <>
                  <span
                    className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl px-1 leading-none transition-opacity duration-150 ${
                      colonVisible ? 'opacity-100' : 'opacity-10'
                    }`}
                  >
                    :
                  </span>
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none opacity-85">
                    {secondsStr}
                  </span>
                </>
              )}

              {/* AM/PM indicator */}
              {!is24Hour && (
                <span className="text-xl sm:text-2xl md:text-3xl font-bold ml-3 uppercase tracking-wider opacity-60">
                  {ampm}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Style & Palette Bar */}
      <div className="relative z-10 w-full max-w-5xl mx-auto pb-5 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
        {/* Digital Typography Style Selectors */}
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md p-1 border border-white/10 rounded-2xl">
          {(
            [
              { id: 'modern', label: 'Modern' },
              { id: 'led', label: '7-Segment LED' },
              { id: 'mono', label: 'Terminal' },
              { id: 'minimal', label: 'Minimal' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                soundEngine.playHaptic();
                setDigitalStyle(s.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                digitalStyle === s.id
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Ambient Color Theme Swatches */}
        <div className="flex items-center gap-2">
          {COLOR_THEMES.map((th) => {
            const isSelected = theme.id === th.id;
            return (
              <button
                key={th.id}
                onClick={() => {
                  soundEngine.playHaptic();
                  setTheme(th);
                }}
                className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: th.color }}
                title={th.name}
              >
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swift 6 Source Code Modal */}
      {showSwiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-amber-500" />
                <h3 className="text-base font-semibold text-white">
                  Swift 6 &amp; SwiftUI Digital Clock
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copySwiftCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Swift Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSwiftModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Code Viewer */}
            <pre className="p-6 font-mono text-xs text-zinc-200 overflow-auto bg-[#0a0a0c] leading-relaxed flex-1">
              {swiftCodeSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
