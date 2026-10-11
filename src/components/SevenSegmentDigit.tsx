import React from 'react';

interface SevenSegmentDigitProps {
  char: string;
  color: string;
  inactiveColor?: string;
  size?: number; // scale multiplier or width
}

// Map each char to which segments are ON (a, b, c, d, e, f, g)
const SEGMENTS_MAP: Record<string, boolean[]> = {
  //       a,     b,     c,     d,     e,     f,     g
  '0': [true,  true,  true,  true,  true,  true,  false],
  '1': [false, true,  true,  false, false, false, false],
  '2': [true,  true,  false, true,  true,  false, true],
  '3': [true,  true,  true,  true,  false, false, true],
  '4': [false, true,  true,  false, false, true,  true],
  '5': [true,  false, true,  true,  false, true,  true],
  '6': [true,  false, true,  true,  true,  true,  true],
  '7': [true,  true,  true,  false, false, false, false],
  '8': [true,  true,  true,  true,  true,  true,  true],
  '9': [true,  true,  true,  true,  false, true,  true],
  ' ': [false, false, false, false, false, false, false],
  '-': [false, false, false, false, false, false, true],
};

export const SevenSegmentDigit: React.FC<SevenSegmentDigitProps> = ({
  char,
  color,
  inactiveColor = 'rgba(255, 255, 255, 0.05)',
  size = 72,
}) => {
  const onSegments = SEGMENTS_MAP[char] || SEGMENTS_MAP[' '];

  // SVG viewBox is 60 x 105
  // Segment polygons with faceted ends for genuine LED clock realism
  return (
    <svg
      width={size}
      height={(size * 105) / 60}
      viewBox="0 0 60 105"
      className="inline-block transform -skew-x-6 select-none"
    >
      {/* Segment a (top) */}
      <polygon
        points="10,8  15,3  45,3  50,8  45,13  15,13"
        fill={onSegments[0] ? color : inactiveColor}
        className="transition-colors duration-150"
      />

      {/* Segment b (top-right) */}
      <polygon
        points="52,10  57,15  57,47  52,52  47,47  47,15"
        fill={onSegments[1] ? color : inactiveColor}
        className="transition-colors duration-150"
      />

      {/* Segment c (bottom-right) */}
      <polygon
        points="52,54  57,59  57,91  52,96  47,91  47,59"
        fill={onSegments[2] ? color : inactiveColor}
        className="transition-colors duration-150"
      />

      {/* Segment d (bottom) */}
      <polygon
        points="10,98  15,93  45,93  50,98  45,103  15,103"
        fill={onSegments[3] ? color : inactiveColor}
        className="transition-colors duration-150"
      />

      {/* Segment e (bottom-left) */}
      <polygon
        points="8,54  13,59  13,91  8,96  3,91  3,59"
        fill={onSegments[4] ? color : inactiveColor}
        className="transition-colors duration-150"
      />

      {/* Segment f (top-left) */}
      <polygon
        points="8,10  13,15  13,47  8,52  3,47  3,15"
        fill={onSegments[5] ? color : inactiveColor}
        className="transition-colors duration-150"
      />

      {/* Segment g (center) */}
      <polygon
        points="10,53  15,48  45,48  50,53  45,58  15,58"
        fill={onSegments[6] ? color : inactiveColor}
        className="transition-colors duration-150"
      />
    </svg>
  );
};

export const SevenSegmentColon: React.FC<{
  color: string;
  inactiveColor?: string;
  size?: number;
  blinking?: boolean;
}> = ({ color, inactiveColor = 'rgba(255, 255, 255, 0.05)', size = 28, blinking = false }) => {
  return (
    <svg
      width={size}
      height={(size * 105) / 28}
      viewBox="0 0 28 105"
      className={`inline-block transform -skew-x-6 select-none ${
        blinking ? 'animate-pulse' : ''
      }`}
    >
      {/* Top Dot */}
      <circle cx="14" cy="32" r="6" fill={color} />
      {/* Bottom Dot */}
      <circle cx="14" cy="74" r="6" fill={color} />
    </svg>
  );
};
