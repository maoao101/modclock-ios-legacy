import React, { useState, useEffect } from 'react';
import { AlarmItem } from '../types/clock';
import { soundEngine } from '../utils/audio';
import { Plus, Bell, Volume2, Trash2, Check, X } from 'lucide-react';

interface AlarmTabProps {
  currentTime: Date;
  onAlarmRinging?: (alarm: AlarmItem) => void;
}

const DEFAULT_ALARMS: AlarmItem[] = [
  {
    id: '1',
    time: '06:30',
    label: 'Morning Run & Swift Coding',
    isEnabled: true,
    days: [1, 2, 3, 4, 5],
    sound: 'radar',
    snooze: true,
  },
  {
    id: '2',
    time: '07:15',
    label: 'Standup & Build Check',
    isEnabled: true,
    days: [1, 2, 3, 4, 5],
    sound: 'chimes',
    snooze: true,
  },
  {
    id: '3',
    time: '09:00',
    label: 'Weekend Brunch',
    isEnabled: false,
    days: [0, 6],
    sound: 'apex',
    snooze: true,
  },
];

const DAYS_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AlarmTab: React.FC<AlarmTabProps> = ({ currentTime, onAlarmRinging }) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem('swiftclock_alarms');
    return saved ? JSON.parse(saved) : DEFAULT_ALARMS;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<AlarmItem | null>(null);

  // Form State for new alarm
  const [formTime, setFormTime] = useState('07:00');
  const [formLabel, setFormLabel] = useState('Alarm');
  const [formDays, setFormDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [formSound, setFormSound] = useState<AlarmItem['sound']>('radar');
  const [formSnooze, setFormSnooze] = useState(true);

  // Save alarms
  useEffect(() => {
    localStorage.setItem('swiftclock_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Check alarm trigger
  useEffect(() => {
    const currentHour = String(currentTime.getHours()).padStart(2, '0');
    const currentMinute = String(currentTime.getMinutes()).padStart(2, '0');
    const currentSeconds = currentTime.getSeconds();
    const currentDay = currentTime.getDay();
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    // Trigger precisely on second 0
    if (currentSeconds === 0) {
      const match = alarms.find((a) => {
        if (!a.isEnabled || a.time !== currentTimeStr) return false;
        if (a.days.length === 0) return true; // once
        return a.days.includes(currentDay);
      });

      if (match && !activeRingingAlarm) {
        setActiveRingingAlarm(match);
        soundEngine.playSound(match.sound);
        if (onAlarmRinging) onAlarmRinging(match);
      }
    }
  }, [currentTime, alarms, activeRingingAlarm, onAlarmRinging]);

  // Repeated audio play while alarm is ringing
  useEffect(() => {
    if (!activeRingingAlarm) return;
    const interval = setInterval(() => {
      soundEngine.playSound(activeRingingAlarm.sound);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeRingingAlarm]);

  const handleToggle = (id: string) => {
    soundEngine.playHaptic();
    setAlarms(
      alarms.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playHaptic();
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  const handleSaveAlarm = () => {
    soundEngine.playHaptic();
    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      time: formTime,
      label: formLabel || 'Alarm',
      isEnabled: true,
      days: formDays,
      sound: formSound,
      snooze: formSnooze,
    };
    setAlarms([...alarms, newAlarm]);
    setIsAddModalOpen(false);
  };

  const toggleDay = (dayIndex: number) => {
    soundEngine.playHaptic();
    if (formDays.includes(dayIndex)) {
      setFormDays(formDays.filter((d) => d !== dayIndex));
    } else {
      setFormDays([...formDays, dayIndex].sort());
    }
  };

  const formatDaysSummary = (days: number[]) => {
    if (days.length === 0) return 'Never / Once';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map((d) => DAYS_NAMES[d]).join(', ');
  };

  const nextAlarm = alarms
    .filter((a) => a.isEnabled)
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Alarms
          </h2>
          <div className="text-xs text-zinc-400 mt-0.5">
            {nextAlarm
              ? `Next alarm set for ${nextAlarm.time} (${nextAlarm.label})`
              : 'No active alarms'}
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
          <span>Add Alarm</span>
        </button>
      </div>

      {/* Alarms List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {alarms.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No alarms set. Click "Add Alarm" to create one.
          </div>
        ) : (
          alarms.map((alarm) => {
            const [hours, minutes] = alarm.time.split(':');
            const hNum = parseInt(hours, 10);
            const isPM = hNum >= 12;
            const displayHour = hNum % 12 === 0 ? 12 : hNum % 12;

            return (
              <div
                key={alarm.id}
                onClick={() => handleToggle(alarm.id)}
                className={`group relative border rounded-2xl p-4.5 transition-all duration-200 flex items-center justify-between cursor-pointer shadow-md ${
                  alarm.isEnabled
                    ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                    : 'bg-zinc-950/60 border-zinc-900 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-light text-white tracking-tight font-mono tabular-nums">
                      {String(displayHour).padStart(2, '0')}:{minutes}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {isPM ? 'PM' : 'AM'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">{alarm.label}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDaysSummary(alarm.days)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{alarm.sound}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleDelete(alarm.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                    title="Delete Alarm"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* iOS Style Switch */}
                  <div
                    className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative ${
                      alarm.isEnabled ? 'bg-green-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        alarm.isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ringing Alarm Modal Banner */}
      {activeRingingAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-pulse">
          <div className="bg-zinc-900 border-2 border-amber-500 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell size={36} className="animate-bounce" />
            </div>

            <div>
              <div className="text-4xl font-mono font-light text-white">
                {activeRingingAlarm.time}
              </div>
              <div className="text-xl font-semibold text-white mt-1">
                {activeRingingAlarm.label}
              </div>
              <div className="text-xs text-amber-400 uppercase tracking-wider mt-1">
                Sound: {activeRingingAlarm.sound}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full mt-2">
              {activeRingingAlarm.snooze && (
                <button
                  onClick={() => {
                    soundEngine.playHaptic();
                    setActiveRingingAlarm(null);
                  }}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Snooze (9m)
                </button>
              )}
              <button
                onClick={() => {
                  soundEngine.playHaptic();
                  setActiveRingingAlarm(null);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Stop Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Alarm Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                Cancel
              </button>
              <h3 className="text-base font-bold text-white">Add Alarm</h3>
              <button
                onClick={handleSaveAlarm}
                className="text-amber-500 hover:text-amber-400 font-semibold text-sm cursor-pointer"
              >
                Save
              </button>
            </div>

            {/* Time Picker */}
            <div className="flex justify-center py-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                className="bg-transparent text-4xl font-mono text-white tracking-wider focus:outline-none cursor-pointer"
              />
            </div>

            {/* Repeat Day Selector */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Repeat Days
              </label>
              <div className="flex items-center justify-between gap-1">
                {DAYS_NAMES.map((day, idx) => {
                  const isSelected = formDays.includes(idx);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`w-9 h-9 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {day[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Label Input */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Label
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="Alarm description"
                className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Sound Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Sound
                </label>
                <button
                  type="button"
                  onClick={() => soundEngine.playSound(formSound)}
                  className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 cursor-pointer"
                >
                  <Volume2 size={13} />
                  Test Sound
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['radar', 'chimes', 'apex', 'marimba', 'uplift'] as const).map(
                  (sound) => (
                    <button
                      key={sound}
                      type="button"
                      onClick={() => {
                        soundEngine.playHaptic();
                        setFormSound(sound);
                        soundEngine.playSound(sound);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                        formSound === sound
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {sound}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Snooze Switch */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-sm text-zinc-300">Allow Snooze</span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playHaptic();
                  setFormSnooze(!formSnooze);
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                  formSnooze ? 'bg-amber-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                    formSnooze ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
