'use client';

import { useState, useEffect } from 'react';

const QUOTES = [
  { text: 'The fortune is in the follow-up.', author: 'Unknown' },
  { text: "Don't wait to buy real estate. Buy real estate and wait.", author: 'Will Rogers' },
  { text: 'Every accomplishment starts with the decision to try.', author: 'John F. Kennedy' },
  { text: 'Success is not the key to happiness. Happiness is the key to success.', author: 'Albert Schweitzer' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: "Your network is your net worth.", author: 'Porter Gale' },
  { text: 'Hustle in silence. Let your success make the noise.', author: 'Unknown' },
  { text: "Real estate cannot be lost or stolen, nor can it be carried away.", author: 'Franklin D. Roosevelt' },
  { text: 'Wake up with determination. Go to bed with satisfaction.', author: 'Unknown' },
  { text: "Ninety percent of all millionaires become so through owning real estate.", author: 'Andrew Carnegie' },
  { text: "Don't count the days, make the days count.", author: 'Muhammad Ali' },
  { text: 'The harder you work, the luckier you get.', author: 'Gary Player' },
];

interface Weather {
  temp: number;
  description: string;
  icon: string;
}

const WEATHER_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Clear sky', icon: '\u2600\uFE0F' },
  1: { desc: 'Mostly clear', icon: '\uD83C\uDF24\uFE0F' },
  2: { desc: 'Partly cloudy', icon: '\u26C5' },
  3: { desc: 'Overcast', icon: '\u2601\uFE0F' },
  45: { desc: 'Foggy', icon: '\uD83C\uDF2B\uFE0F' },
  48: { desc: 'Icy fog', icon: '\uD83C\uDF2B\uFE0F' },
  51: { desc: 'Light drizzle', icon: '\uD83C\uDF26\uFE0F' },
  53: { desc: 'Drizzle', icon: '\uD83C\uDF26\uFE0F' },
  55: { desc: 'Heavy drizzle', icon: '\uD83C\uDF27\uFE0F' },
  61: { desc: 'Light rain', icon: '\uD83C\uDF26\uFE0F' },
  63: { desc: 'Rain', icon: '\uD83C\uDF27\uFE0F' },
  65: { desc: 'Heavy rain', icon: '\uD83C\uDF27\uFE0F' },
  71: { desc: 'Light snow', icon: '\uD83C\uDF28\uFE0F' },
  73: { desc: 'Snow', icon: '\u2744\uFE0F' },
  75: { desc: 'Heavy snow', icon: '\u2744\uFE0F' },
  80: { desc: 'Rain showers', icon: '\uD83C\uDF27\uFE0F' },
  81: { desc: 'Rain showers', icon: '\uD83C\uDF27\uFE0F' },
  82: { desc: 'Heavy showers', icon: '\u26C8\uFE0F' },
  85: { desc: 'Snow showers', icon: '\uD83C\uDF28\uFE0F' },
  86: { desc: 'Heavy snow showers', icon: '\u2744\uFE0F' },
  95: { desc: 'Thunderstorm', icon: '\u26A1' },
  96: { desc: 'Thunderstorm w/ hail', icon: '\u26A1' },
  99: { desc: 'Thunderstorm w/ hail', icon: '\u26A1' },
};

function getGreeting(hour: number): { text: string; emoji: string } {
  if (hour < 5) return { text: 'Burning the midnight oil', emoji: '\uD83C\uDF19' };
  if (hour < 12) return { text: 'Good morning', emoji: '\u2615' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '\u2600\uFE0F' };
  if (hour < 21) return { text: 'Good evening', emoji: '\uD83C\uDF07' };
  return { text: 'Good night', emoji: '\uD83C\uDF19' };
}

export default function GreetingCard() {
  const [now, setNow] = useState<Date | null>(null);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    const current = new Date();
    setNow(current);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Fetch weather for Ashburn, VA (free Open-Meteo API, no key needed)
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=39.0438&longitude=-77.4874&current=temperature_2m,weathercode&temperature_unit=fahrenheit&timezone=America%2FNew_York'
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.current) {
          const code = data.current.weathercode as number;
          const info = WEATHER_CODES[code] || { desc: 'Unknown', icon: '\uD83C\uDF24\uFE0F' };
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            description: info.desc,
            icon: info.icon,
          });
        }
      })
      .catch(() => {});

    // Update clock every minute
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const greeting = getGreeting(now.getHours());
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="max-w-[1440px] mx-auto px-8 mt-6">
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1714 0%, #2c2520 50%, #1a1714 100%)',
          border: '1px solid rgba(184,145,58,0.15)',
        }}
      >
        {/* Subtle crosshatch pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(212,168,83,0.4) 30px, rgba(212,168,83,0.4) 31px), repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(212,168,83,0.4) 30px, rgba(212,168,83,0.4) 31px)',
          }}
        />

        {/* Gold accent top */}
        <div
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #d4a853 30%, #d4a853 70%, transparent)',
          }}
        />

        <div className="relative px-8 py-6 flex items-center justify-between gap-8">
          {/* Left: Greeting + Date */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#d4a853]/50 tracking-[0.2em] uppercase font-body font-medium mb-1">
              {dateStr}
            </p>
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-[28px] font-semibold text-white/95 tracking-wide"
            >
              {greeting.text}, Neena {greeting.emoji}
            </h2>
            <p className="text-[13px] text-white/30 font-body mt-1">{timeStr}</p>
          </div>

          {/* Center: Quote */}
          <div className="flex-1 min-w-0 px-6 border-l border-r border-white/[0.06]">
            <p className="text-[13px] text-white/60 font-body italic leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-[11px] text-[#d4a853]/50 font-body mt-2">
              &mdash; {quote.author}
            </p>
          </div>

          {/* Right: Weather */}
          <div className="flex-shrink-0 text-right">
            {weather ? (
              <>
                <p className="text-[36px] leading-none text-white/90 font-body font-light">
                  {weather.icon} {weather.temp}&deg;
                </p>
                <p className="text-[11px] text-white/40 font-body mt-1">{weather.description}</p>
                <p className="text-[10px] text-white/20 font-body mt-0.5">Ashburn, VA</p>
              </>
            ) : (
              <div className="text-[11px] text-white/20 font-body">Loading weather...</div>
            )}
          </div>
        </div>

        {/* Gold accent bottom */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.2) 30%, rgba(212,168,83,0.2) 70%, transparent)',
          }}
        />
      </div>
    </div>
  );
}
