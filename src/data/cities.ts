import { WorldCity } from '../types/clock';

export const POPULAR_CITIES: WorldCity[] = [
  { id: 'cupertino', name: 'Cupertino', country: 'United States', timezone: 'America/Los_Angeles', flag: '🇺🇸', region: 'Americas' },
  { id: 'new-york', name: 'New York', country: 'United States', timezone: 'America/New_York', flag: '🇺🇸', region: 'Americas' },
  { id: 'london', name: 'London', country: 'United Kingdom', timezone: 'Europe/London', flag: '🇬🇧', region: 'Europe' },
  { id: 'paris', name: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷', region: 'Europe' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵', region: 'Asia' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺', region: 'Oceania' },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich', flag: '🇨🇭', region: 'Europe' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬', region: 'Asia' },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', flag: '🇦🇪', region: 'Middle East' },
  { id: 'hong-kong', name: 'Hong Kong', country: 'Hong Kong SAR', timezone: 'Asia/Hong_Kong', flag: '🇭🇰', region: 'Asia' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪', region: 'Europe' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷', region: 'Asia' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦', region: 'Americas' },
  { id: 'san-francisco', name: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles', flag: '🇺🇸', region: 'Americas' },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷', region: 'Americas' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬', region: 'Africa' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳', region: 'Asia' },
  { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', timezone: 'Atlantic/Reykjavik', flag: '🇮🇸', region: 'Europe' },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿', region: 'Oceania' },
  { id: 'honolulu', name: 'Honolulu', country: 'United States', timezone: 'Pacific/Honolulu', flag: '🇺🇸', region: 'Americas' },
];

export const INITIAL_CITIES: WorldCity[] = [
  POPULAR_CITIES[0], // Cupertino
  POPULAR_CITIES[2], // London
  POPULAR_CITIES[4], // Tokyo
  POPULAR_CITIES[1], // New York
  POPULAR_CITIES[5], // Sydney
];
