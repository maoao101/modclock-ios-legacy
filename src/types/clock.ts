export type ClockTab = 'world' | 'alarm' | 'stopwatch' | 'timer' | 'nightstand' | 'swift' | 'cloc';

export interface WorldCity {
  id: string;
  name: string;
  country: string;
  timezone: string;
  flag: string;
  region: string;
}

export interface AlarmItem {
  id: string;
  time: string; // "07:30"
  label: string;
  isEnabled: boolean;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat. Empty = Once
  sound: 'radar' | 'chimes' | 'apex' | 'marimba' | 'uplift';
  snooze: boolean;
}

export interface Lap {
  id: string;
  lapNumber: number;
  lapTimeMs: number;
  overallTimeMs: number;
  isFastest?: boolean;
  isSlowest?: boolean;
}

export interface TimerPreset {
  id: string;
  label: string;
  seconds: number;
  category: string;
  iconName?: string;
}

export type WatchFaceTheme = 'cupertino' | 'chronograph' | 'california' | 'oled' | 'bauhaus' | 'digital' | 'minimal';

export interface SwiftSourceFile {
  id: string;
  name: string;
  path: string;
  category: 'App & Architecture' | 'Views' | 'Engines & Logic' | 'CLI Tool';
  description: string;
  code: string;
}

export interface SwiftClocFileResult {
  fileName: string;
  path: string;
  blank: number;
  comment: number;
  docComment: number;
  code: number;
  total: number;
  structs: number;
  classes: number;
  actors: number;
  protocols: number;
  functions: number;
  macros: number;
}

export interface SwiftClocSummary {
  filesCount: number;
  blank: number;
  comment: number;
  code: number;
  total: number;
  commentRatio: number;
  files: SwiftClocFileResult[];
  constructsTotal: {
    structs: number;
    classes: number;
    actors: number;
    protocols: number;
    functions: number;
    macros: number;
  };
}
