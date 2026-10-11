import React, { useState } from 'react';
import { WorldCity } from '../types/clock';
import { POPULAR_CITIES, INITIAL_CITIES } from '../data/cities';
import { AnalogClock } from './AnalogClock';
import { Plus, Trash2, Sun, Moon, Clock, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface WorldClockTabProps {
  currentTime: Date;
}

export const WorldClockTab: React.FC<WorldClockTabProps> = ({ currentTime }) => {
  const [cities, setCities] = useState<WorldCity[]>(INITIAL_CITIES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeOffsetHours, setTimeOffsetHours] = useState(0); // Scrubber offset in hours

  // Compute simulated time based on scrubber
  const simulatedTime = new Date(currentTime.getTime() + timeOffsetHours * 3600 * 1000);

  const handleAddCity = (city: WorldCity) => {
    soundEngine.playHaptic();
    if (!cities.some((c) => c.id === city.id)) {
      setCities([...cities, city]);
    }
    setIsAddModalOpen(false);
    setSearchQuery('');
  };

  const handleRemoveCity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playHaptic();
    setCities(cities.filter((c) => c.id !== id));
  };

  const getCityDate = (timezone: string): Date => {
    try {
      const invDate = new Date(
        simulatedTime.toLocaleString('en-US', { timeZone: timezone })
      );
      return invDate;
    } catch {
      return simulatedTime;
    }
  };

  const getTimeDifferenceText = (timezone: string): { label: string; isTomorrow: boolean; isYesterday: boolean } => {
    try {
      const cityDate = getCityDate(timezone);
      const localDay = simulatedTime.getDate();
      const cityDay = cityDate.getDate();

      // Calculate approximate difference in hours
      const diffMs = cityDate.getTime() - simulatedTime.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));

      let dayText = 'Today';
      let isTomorrow = false;
      let isYesterday = false;

      if (cityDay > localDay || (cityDay === 1 && localDay > 25)) {
        dayText = 'Tomorrow';
        isTomorrow = true;
      } else if (cityDay < localDay || (localDay === 1 && cityDay > 25)) {
        dayText = 'Yesterday';
        isYesterday = true;
      }

      if (diffHours === 0) {
        return { label: `${dayText}, Same time`, isTomorrow, isYesterday };
      } else if (diffHours > 0) {
        return { label: `${dayText}, +${diffHours}HRS`, isTomorrow, isYesterday };
      } else {
        return { label: `${dayText}, ${diffHours}HRS`, isTomorrow, isYesterday };
      }
    } catch {
      return { label: 'Today', isTomorrow: false, isYesterday: false };
    }
  };

  const filteredAvailableCities = POPULAR_CITIES.filter(
    (c) =>
      !cities.some((active) => active.id === c.id) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            World Clock
          </h2>
          <div className="text-xs text-zinc-400 mt-0.5">
            Synchronized with system time & international time zones
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playHaptic();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-500 hover:text-amber-400 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={18} />
          <span>Add City</span>
        </button>
      </div>

      {/* Time Scrubber / Travel simulation */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
            <Clock size={14} className="text-amber-500" />
            <span>Time Zone Scrubber</span>
            {timeOffsetHours !== 0 && (
              <span className="text-amber-400 font-mono">
                ({timeOffsetHours > 0 ? `+${timeOffsetHours}` : timeOffsetHours}h offset)
              </span>
            )}
          </div>
          {timeOffsetHours !== 0 && (
            <button
              onClick={() => {
                soundEngine.playHaptic();
                setTimeOffsetHours(0);
              }}
              className="flex items-center gap-1 text-amber-500 hover:text-amber-400 cursor-pointer text-xs"
            >
              <RotateCcw size={12} />
              Reset to Now
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-mono">-12h</span>
          <input
            type="range"
            min="-12"
            max="12"
            step="0.5"
            value={timeOffsetHours}
            onChange={(e) => {
              setTimeOffsetHours(parseFloat(e.target.value));
              soundEngine.playHaptic();
            }}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-750 rounded-lg"
          />
          <span className="text-xs text-zinc-500 font-mono">+12h</span>
        </div>
      </div>

      {/* City Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto pr-1 flex-1">
        {cities.map((city) => {
          const cityTime = getCityDate(city.timezone);
          const diff = getTimeDifferenceText(city.timezone);
          const hour = cityTime.getHours();
          const isDaytime = hour >= 6 && hour < 19;

          const hoursStr = cityTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: city.timezone,
          });

          return (
            <div
              key={city.id}
              className="group relative bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 transition-all duration-200 flex items-center justify-between shadow-lg"
            >
              {/* Left Details */}
              <div className="space-y-1 pr-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>{diff.label}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    {isDaytime ? (
                      <Sun size={12} className="text-amber-400" />
                    ) : (
                      <Moon size={12} className="text-indigo-400" />
                    )}
                    <span>{isDaytime ? 'Day' : 'Night'}</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl">{city.flag}</span>
                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {city.name}
                  </h3>
                </div>

                <div className="text-xs text-zinc-500 truncate max-w-[140px]">
                  {city.country}
                </div>
              </div>

              {/* Right Side: Mini Analog + Big Digital */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <AnalogClock
                    time={cityTime}
                    size={52}
                    showSeconds={false}
                    theme="cupertino"
                  />
                </div>

                <div className="text-right">
                  <div className="text-2xl font-light text-white tracking-tight font-mono tabular-nums">
                    {hoursStr.split(' ')[0]}
                  </div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {hoursStr.split(' ')[1]}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemoveCity(city.id, e)}
                  title="Remove city"
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer ml-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add City Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">Choose a City</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm px-2 py-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="my-3">
              <input
                type="text"
                placeholder="Search city or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {filteredAvailableCities.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  No matching cities found.
                </div>
              ) : (
                filteredAvailableCities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleAddCity(c)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-zinc-800/80 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{c.flag}</span>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-amber-400">
                          {c.name}
                        </div>
                        <div className="text-xs text-zinc-400">{c.country}</div>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{c.region}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
