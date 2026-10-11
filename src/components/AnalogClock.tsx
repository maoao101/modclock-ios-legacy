import React from 'react';
import { WatchFaceTheme } from '../types/clock';

interface AnalogClockProps {
  time: Date;
  size?: number;
  theme?: WatchFaceTheme;
  showSeconds?: boolean;
  smoothSeconds?: boolean;
  interactive?: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  time,
  size = 240,
  theme = 'cupertino',
  showSeconds = true,
  smoothSeconds = true,
}) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const milliseconds = time.getMilliseconds();

  // Angle math (0 deg = 12 o'clock, clockwise)
  const secondFraction = smoothSeconds ? seconds + milliseconds / 1000 : seconds;
  const minuteFraction = minutes + secondFraction / 60;
  const hourFraction = (hours % 12) + minuteFraction / 60;

  const secondAngle = secondFraction * 6; // 360 / 60
  const minuteAngle = minuteFraction * 6; // 360 / 60
  const hourAngle = hourFraction * 30; // 360 / 12

  const radius = size / 2;
  const center = radius;

  // Render dial markers
  const renderDialMarkers = () => {
    const markers = [];
    const isChrono = theme === 'chronograph';
    const isMinimal = theme === 'minimal';
    const isBauhaus = theme === 'bauhaus';

    for (let i = 0; i < 60; i++) {
      const angleDeg = i * 6;
      const angleRad = (angleDeg - 90) * (Math.PI / 180);
      const isMajor = i % 5 === 0;

      if (isMinimal && !isMajor) continue;

      const outerR = radius * 0.94;
      const innerR = isMajor
        ? radius * (isChrono ? 0.8 : isBauhaus ? 0.82 : 0.85)
        : radius * (isChrono ? 0.88 : 0.9);

      const x1 = center + outerR * Math.cos(angleRad);
      const y1 = center + outerR * Math.sin(angleRad);
      const x2 = center + innerR * Math.cos(angleRad);
      const y2 = center + innerR * Math.sin(angleRad);

      const strokeColor =
        theme === 'oled'
          ? isMajor ? '#38BDF8' : '#0369A1'
          : theme === 'california'
          ? isMajor ? '#E2E8F0' : '#475569'
          : isMajor
          ? '#F8FAFC'
          : '#475569';

      markers.push(
        <line
          key={`tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={isMajor ? (isChrono ? 2.5 : 2.0) : 1.0}
          strokeLinecap="round"
        />
      );
    }
    return markers;
  };

  // Render Numbers for Roman/Arabic California or Bauhaus
  const renderNumbers = () => {
    if (theme === 'minimal' || theme === 'oled') return null;

    const numbers = [];
    for (let i = 1; i <= 12; i++) {
      const angleDeg = i * 30;
      const angleRad = (angleDeg - 90) * (Math.PI / 180);
      const textRadius = radius * 0.72;
      const x = center + textRadius * Math.cos(angleRad);
      const y = center + textRadius * Math.sin(angleRad);

      let text = String(i);
      // California dial: Top half Roman numerals (VIII, IX, X, XI, XII, I, II), Bottom half Arabic (4, 5, 6, 7, 8)
      if (theme === 'california') {
        const romanMap: Record<number, string> = {
          1: 'I',
          2: 'II',
          10: 'X',
          11: 'XI',
          12: 'XII',
        };
        if (romanMap[i]) text = romanMap[i];
      }

      numbers.push(
        <text
          key={`num-${i}`}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          className="select-none font-sans font-semibold tracking-tight"
          fill={theme === 'california' ? '#E2E8F0' : '#94A3B8'}
          fontSize={size * 0.08}
        >
          {text}
        </text>
      );
    }
    return numbers;
  };

  const getDialBg = () => {
    switch (theme) {
      case 'oled':
        return '#020617';
      case 'california':
        return '#0B1120';
      case 'chronograph':
        return '#0F172A';
      case 'bauhaus':
        return '#18181B';
      default:
        return '#09090B';
    }
  };

  return (
    <div
      className="relative flex items-center justify-center transition-all duration-300"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-2xl overflow-visible"
      >
        {/* Outer bezel */}
        <circle
          cx={center}
          cy={center}
          r={radius - 1}
          fill={getDialBg()}
          stroke="#27272A"
          strokeWidth="2.5"
        />

        {/* Inner bezel depth ring */}
        <circle
          cx={center}
          cy={center}
          r={radius * 0.97}
          fill="none"
          stroke="#18181B"
          strokeWidth="1.5"
        />

        {/* Date Complication (Right side) */}
        <g transform={`translate(${center + radius * 0.42}, ${center - 11})`}>
          <rect
            width="28"
            height="22"
            rx="4"
            fill="#1E293B"
            stroke="#334155"
            strokeWidth="1"
          />
          <text
            x="14"
            y="14"
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="11"
            fontWeight="700"
            className="font-mono"
          >
            {time.getDate()}
          </text>
        </g>

        {/* Brand / SwiftUI text watermark */}
        <text
          x={center}
          y={center - radius * 0.36}
          textAnchor="middle"
          fill="#52525B"
          fontSize={Math.max(9, size * 0.04)}
          fontWeight="600"
          letterSpacing="0.1em"
        >
          SWIFT
        </text>

        {/* Chronograph subdials if chronograph theme */}
        {theme === 'chronograph' && (
          <g>
            {/* 30 minute subdial at top */}
            <circle
              cx={center}
              cy={center - radius * 0.38}
              r={radius * 0.22}
              fill="#090D16"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Small seconds subdial at bottom */}
            <circle
              cx={center}
              cy={center + radius * 0.38}
              r={radius * 0.22}
              fill="#090D16"
              stroke="#334155"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Tick markers & Numbers */}
        {renderDialMarkers()}
        {renderNumbers()}

        {/* Hour Hand */}
        <g transform={`rotate(${hourAngle}, ${center}, ${center})`}>
          <line
            x1={center}
            y1={center + radius * 0.12}
            x2={center}
            y2={center - radius * 0.52}
            stroke="#F8FAFC"
            strokeWidth={size * 0.024}
            strokeLinecap="round"
          />
          {/* Inner lume bar */}
          <line
            x1={center}
            y1={center - radius * 0.15}
            x2={center}
            y2={center - radius * 0.48}
            stroke="#09090B"
            strokeWidth={size * 0.01}
            strokeLinecap="round"
          />
        </g>

        {/* Minute Hand */}
        <g transform={`rotate(${minuteAngle}, ${center}, ${center})`}>
          <line
            x1={center}
            y1={center + radius * 0.14}
            x2={center}
            y2={center - radius * 0.78}
            stroke="#F8FAFC"
            strokeWidth={size * 0.016}
            strokeLinecap="round"
          />
          {/* Inner lume bar */}
          <line
            x1={center}
            y1={center - radius * 0.2}
            x2={center}
            y2={center - radius * 0.74}
            stroke="#09090B"
            strokeWidth={size * 0.007}
            strokeLinecap="round"
          />
        </g>

        {/* Second Hand (Signature Cupertino Orange with tail) */}
        {showSeconds && (
          <g transform={`rotate(${secondAngle}, ${center}, ${center})`}>
            {/* Tail counterweight */}
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={center + radius * 0.22}
              stroke="#FF9F0A"
              strokeWidth={size * 0.009}
              strokeLinecap="round"
            />
            {/* Main second pointer */}
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={center - radius * 0.88}
              stroke="#FF9F0A"
              strokeWidth={size * 0.008}
              strokeLinecap="round"
            />
            {/* Center orange hub */}
            <circle cx={center} cy={center} r={size * 0.024} fill="#FF9F0A" />
            <circle cx={center} cy={center} r={size * 0.01} fill="#09090B" />
          </g>
        )}
      </svg>
    </div>
  );
};
