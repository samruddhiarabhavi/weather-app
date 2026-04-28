import { useCallback, useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────
   GLOBAL STYLES  (injected once into <head>)
───────────────────────────────────────────── */
const STYLES = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --font: 'Outfit', sans-serif;
    --mono: 'Space Mono', monospace;
    --bg: #09111f;
    --card: rgba(11, 24, 58, 0.68);
    --card-hover: rgba(18, 42, 100, 0.62);
    --border: rgba(80, 140, 255, 0.13);
    --border-hover: rgba(100, 170, 255, 0.26);
    --text: #ddeeff;
    --muted: rgba(150, 195, 255, 0.52);
    --dim: rgba(150, 195, 255, 0.3);
    --blue: #1a6fd4;
    --teal: #0fa07c;
    --sky: #7dd3fc;
    --green: #34d399;
    --r-md: 13px;
    --r-lg: 22px;
  }

  html { font-size: 16px; }

  body {
    font-family: var(--font);
    background: linear-gradient(140deg, #09111f 0%, #0c1a2e 45%, #081320 100%);
    background-attachment: fixed;
    min-height: 100vh;
    color: var(--text);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  input, button, select { font-family: var(--font); }
  a { color: rgba(100,170,255,0.7); text-decoration: none; }
  a:hover { color: rgba(130,190,255,0.9); }

  ::-webkit-scrollbar { width: 5px; height: 4px; }
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
  ::-webkit-scrollbar-thumb { background: rgba(100,150,255,0.2); border-radius: 3px; }

  /* ── Shell ── */
  .shell {
    min-height: 100vh;
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
    position: relative;
  }
  .aurora {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 80% 55% at 28% 18%, rgba(26,80,170,0.17) 0%, transparent 62%),
      radial-gradient(ellipse 55% 40% at 82% 72%, rgba(15,120,95,0.10) 0%, transparent 58%);
  }
  .content { position: relative; z-index: 1; }

  /* ── Brand / Header ── */
  .brand {
    font-family: var(--mono);
    font-size: 0.95rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(140,185,255,0.5);
    margin-bottom: 1.25rem;
  }
  .datetime {
    display: flex; align-items: center; gap: 0.5rem;
    font-family: var(--mono); font-size: 0.75rem;
    color: var(--dim); margin-bottom: 2rem;
  }
  .pulse {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.3; transform:scale(0.75); }
  }

  /* ── Search ── */
  .search-row { display: flex; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
  .field {
    flex: 1; min-width: 190px; position: relative; display: flex; align-items: center;
  }
  .field-icon {
    position: absolute; left: 0.85rem;
    font-size: 0.8rem; color: var(--muted); pointer-events: none;
    font-family: var(--mono);
  }
  .input {
    width: 100%;
    padding: 0.85rem 1.1rem 0.85rem 2.4rem;
    border-radius: var(--r-md);
    border: 1px solid rgba(100,150,255,0.18);
    background: rgba(12, 28, 72, 0.72);
    color: var(--text);
    font-size: 0.95rem;
    backdrop-filter: blur(14px);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input:focus {
    border-color: rgba(100,180,255,0.45);
    box-shadow: 0 0 0 3px rgba(26,111,212,0.1);
  }
  .input::placeholder { color: rgba(140,175,230,0.3); }
  .input-key { font-family: var(--mono); font-size: 0.78rem; letter-spacing: 0.06em; }

  .btn {
    padding: 0.85rem 1.4rem;
    border-radius: var(--r-md); border: none;
    font-size: 0.95rem; font-weight: 600;
    cursor: pointer; white-space: nowrap;
    transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 0.35rem;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--blue), var(--teal));
    color: #fff; min-width: 96px;
    box-shadow: 0 4px 18px rgba(26,111,212,0.28);
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 7px 26px rgba(26,111,212,0.42);
  }
  .btn-primary:disabled { opacity: 0.42; cursor: not-allowed; }
  .btn-ghost {
    background: rgba(18, 42, 100, 0.52);
    border: 1px solid var(--border);
    color: var(--muted); font-size: 0.82rem;
    font-family: var(--mono);
  }
  .btn-ghost:hover:not(:disabled) {
    background: rgba(28, 60, 140, 0.6);
    border-color: var(--border-hover); color: var(--text);
  }
  .btn-unit { min-width: 58px; font-family: var(--mono); }

  .hint { font-size: 0.74rem; color: var(--dim); font-family: var(--mono); }

  /* ── Spinner ── */
  .spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    animation: spin 0.65s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Error ── */
  .error {
    padding: 0.9rem 1.1rem; border-radius: 11px; margin-bottom: 1rem;
    background: rgba(200,50,50,0.09);
    border: 1px solid rgba(200,80,80,0.22);
    color: #f9a8a8; font-size: 0.87rem;
  }

  /* ── Skeleton ── */
  .skeleton {
    height: 300px; border-radius: var(--r-lg); margin-top: 1.5rem;
    background: linear-gradient(90deg,
      rgba(18,42,100,0.3) 25%, rgba(36,76,160,0.18) 50%, rgba(18,42,100,0.3) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;
  }
  @keyframes shimmer {
    0%   { background-position:  200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Card ── */
  .card {
    background: var(--card);
    backdrop-filter: blur(22px);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 1.75rem 2rem;
    margin-bottom: 1.25rem;
    animation: fadeUp 0.38s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Weather Main ── */
  .weather-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
  .city { font-size: 1.45rem; font-weight: 600; color: #c4deff; margin-bottom: 0.18rem; }
  .coords { font-family: var(--mono); font-size: 0.75rem; color: var(--dim); margin-bottom: 1.4rem; }
  .temp {
    font-family: var(--mono); font-size: 4.8rem; font-weight: 700; line-height: 1;
    background: linear-gradient(130deg, var(--sky), var(--green));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .temp-unit { font-size: 2.2rem; }
  .condition { font-size: 0.95rem; color: rgba(175,210,255,0.68); margin: 0.35rem 0 0.3rem; text-transform: capitalize; }
  .feels { font-family: var(--mono); font-size: 0.75rem; color: var(--dim); }
  .weather-icon {
    font-size: 4.5rem; line-height: 1; flex-shrink: 0; margin-top: 0.3rem;
    filter: drop-shadow(0 0 18px rgba(100,200,255,0.28));
  }

  /* ── Stats Grid ── */
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(128px, 1fr)); gap: 0.85rem; margin-top: 1.75rem; }
  .stat {
    background: rgba(18, 42, 100, 0.48);
    border-radius: 15px; padding: 0.9rem 1rem;
    border: 1px solid rgba(80,140,255,0.09);
    transition: background 0.18s, border-color 0.18s;
  }
  .stat:hover { background: rgba(28,60,140,0.55); border-color: rgba(100,170,255,0.18); }
  .stat-label {
    font-family: var(--mono); font-size: 0.67rem; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(140,185,255,0.4); margin-bottom: 0.38rem;
  }
  .stat-value { font-size: 1.1rem; font-weight: 600; color: #a8ccff; line-height: 1.2; }
  .stat-sub { font-family: var(--mono); font-size: 0.67rem; color: var(--dim); margin-top: 0.18rem; }
  .bar { height: 3px; background: rgba(80,140,255,0.1); border-radius: 2px; margin-top: 0.55rem; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 2px; transition: width 0.75s ease; }

  /* ── Forecast ── */
  .section-label {
    font-family: var(--mono); font-size: 0.67rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: var(--dim); margin-bottom: 1.1rem;
  }
  .forecast-row { display: flex; gap: 0.7rem; overflow-x: auto; padding-bottom: 0.4rem; }
  .forecast-row::-webkit-scrollbar { height: 3px; }
  .day-card {
    flex: 0 0 auto; min-width: 106px;
    background: rgba(18,42,100,0.42);
    border-radius: 15px; padding: 1rem 0.9rem;
    border: 1px solid rgba(80,140,255,0.09);
    text-align: center; transition: all 0.18s; cursor: default;
  }
  .day-card:hover {
    background: rgba(28,60,140,0.55);
    border-color: var(--border-hover);
    transform: translateY(-3px);
  }
  .day-name { font-family: var(--mono); font-size: 0.67rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dim); margin-bottom: 0.5rem; }
  .day-icon { font-size: 1.7rem; margin: 0.25rem 0; filter: drop-shadow(0 0 7px rgba(100,200,255,0.22)); }
  .day-temps { font-size: 0.85rem; font-weight: 600; color: #94bcff; margin-top: 0.28rem; }
  .day-lo { color: rgba(140,180,255,0.38); font-weight: 400; }
  .day-desc { font-size: 0.65rem; color: var(--dim); margin-top: 0.22rem; text-transform: capitalize; line-height: 1.3; }
  .day-hum { font-family: var(--mono); font-size: 0.65rem; color: rgba(100,175,255,0.38); margin-top: 0.35rem; }

  /* ── Empty ── */
  .empty { text-align: center; padding: 3rem 2rem; }
  .empty-icon { font-size: 2.8rem; opacity: 0.22; margin-bottom: 1rem; font-family: var(--mono); }
  .empty-title { font-size: 0.95rem; color: rgba(140,185,255,0.35); margin-bottom: 0.4rem; }
  .empty-sub { font-family: var(--mono); font-size: 0.72rem; color: var(--dim); margin-bottom: 2rem; }
  .steps { display: flex; flex-direction: column; gap: 0.65rem; max-width: 320px; margin: 0 auto; text-align: left; }
  .step { display: flex; align-items: center; gap: 0.65rem; font-size: 0.82rem; color: rgba(140,185,255,0.32); }
  .step-num {
    width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
    background: rgba(80,140,255,0.09); border: 1px solid rgba(80,140,255,0.18);
    font-family: var(--mono); font-size: 0.7rem; color: rgba(140,185,255,0.45);
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Weather condition icons (text-based, no emojis) ── */
  .wi { display: inline-block; font-family: var(--mono); font-size: 1em; }
`

/* ─────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────── */
const API_BASE = 'https://api.openweathermap.org/data/2.5'
const ENV_KEY  = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_OPENWEATHER_API_KEY || '') : ''

// Text-symbol weather icons — no emoji, clean and minimal
const ICON_MAP = {
  '01d': '[ SUN ]', '01n': '[ MOON ]',
  '02d': '[ SUN/CLD ]', '02n': '[ MOON/CLD ]',
  '03d': '[ CLOUD ]', '03n': '[ CLOUD ]',
  '04d': '[ OCAST ]', '04n': '[ OCAST ]',
  '09d': '[ RAIN ]', '09n': '[ RAIN ]',
  '10d': '[ SHWR ]', '10n': '[ SHWR ]',
  '11d': '[ STORM ]', '11n': '[ STORM ]',
  '13d': '[ SNOW ]', '13n': '[ SNOW ]',
  '50d': '[ MIST ]', '50n': '[ MIST ]',
}
// Larger display icons using OWM's icon images instead
const getIconUrl  = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`
const getIconText = (code) => ICON_MAP[code] ?? '[ -- ]'

const toC  = (c)    => Math.round(c)
const toF  = (c)    => Math.round(c * 9/5 + 32)
const cvt  = (c, u) => u === 'imperial' ? toF(c) : toC(c)
const unitLabel  = (u) => u === 'imperial' ? '°F' : '°C'
const speedLabel = (u) => u === 'imperial' ? 'mph' : 'm/s'
const cvtSpeed   = (mps, u) => u === 'imperial' ? Math.round(mps * 2.237) : mps.toFixed(1)

const fmtTime = (ts) =>
  new Date(ts * 1000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })

const dayName = (ts) =>
  new Date(ts * 1000).toLocaleDateString('en', { weekday: 'short' }).toUpperCase()

const windDir = (deg) => ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8]

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const groupForecast = (list) => {
  const map = {}
  list.forEach((item) => {
    const d = new Date(item.dt * 1000).toDateString()
    if (!map[d]) map[d] = item
  })
  return Object.values(map).slice(1, 6)
}

/* ─────────────────────────────────────────────
   API CALLS
───────────────────────────────────────────── */
async function apiFetch(url) {
  const res = await fetch(url)
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Request failed') }
  return res.json()
}

async function getWeatherByCity(city, key, units) {
  const q = encodeURIComponent(city)
  const [w, f] = await Promise.all([
    apiFetch(`${API_BASE}/weather?q=${q}&appid=${key}&units=${units}`),
    apiFetch(`${API_BASE}/forecast?q=${q}&appid=${key}&units=${units}`),
  ])
  return { weather: w, forecast: groupForecast(f.list) }
}

async function getWeatherByCoords(lat, lon, key, units) {
  const ll = `lat=${lat}&lon=${lon}`
  const [w, f] = await Promise.all([
    apiFetch(`${API_BASE}/weather?${ll}&appid=${key}&units=${units}`),
    apiFetch(`${API_BASE}/forecast?${ll}&appid=${key}&units=${units}`),
  ])
  return { weather: w, forecast: groupForecast(f.list) }
}

/* ─────────────────────────────────────────────
   CUSTOM HOOK
───────────────────────────────────────────── */
function useWeather() {
  const [weather,  setWeather]  = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const run = useCallback(async (fn) => {
    setLoading(true); setError('')
    try {
      const { weather: w, forecast: f } = await fn()
      setWeather(w); setForecast(f)
    } catch (e) {
      setError(e.message); setWeather(null); setForecast([])
    } finally { setLoading(false) }
  }, [])

  const searchCity = useCallback((city, key, units) => {
    run(() => getWeatherByCity(city, key, units))
  }, [run])

  const searchLocation = useCallback((key, units) => {
    if (!key) { setError('Enter your API key first.'); return }
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return }
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => run(() => getWeatherByCoords(coords.latitude, coords.longitude, key, units)),
      () => { setError('Could not get location. Search by city instead.'); setLoading(false) }
    )
  }, [run])

  return { weather, forecast, loading, error, searchCity, searchLocation }
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS  (defined inline)
───────────────────────────────────────────── */

function StatCard({ label, value, sub, bar, barColor }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {bar !== undefined && (
        <div className="bar">
          <div
            className="bar-fill"
            style={{ width: `${Math.min(bar, 100)}%`, background: barColor || 'linear-gradient(90deg,#1a6fd4,#0fa07c)' }}
          />
        </div>
      )}
    </div>
  )
}

function WeatherCard({ weather, unit }) {
  const ul = unitLabel(unit)
  const sl = speedLabel(unit)
  return (
    <div className="card">
      <div className="weather-header">
        <div>
          <div className="city">{weather.name}, {weather.sys.country}</div>
          <div className="coords">
            {weather.coord.lat.toFixed(2)}&deg; / {weather.coord.lon.toFixed(2)}&deg;
          </div>
          <div className="temp">
            {cvt(weather.main.temp, unit)}<span className="temp-unit">{ul}</span>
          </div>
          <div className="condition">{cap(weather.weather[0].description)}</div>
          <div className="feels">
            Feels {cvt(weather.main.feels_like, unit)}{ul}
            &nbsp;&middot;&nbsp;
            H {cvt(weather.main.temp_max, unit)}{ul}
            &nbsp;
            L {cvt(weather.main.temp_min, unit)}{ul}
          </div>
        </div>
        <div className="weather-icon">
          <img
            src={getIconUrl(weather.weather[0].icon)}
            alt={weather.weather[0].description}
            width={90} height={90}
            style={{ display:'block' }}
          />
        </div>
      </div>

      <div className="stats">
        <StatCard label="Humidity"    value={`${weather.main.humidity}%`}
          bar={weather.main.humidity} barColor="linear-gradient(90deg,#38bdf8,#1a6fd4)" />
        <StatCard label="Wind"
          value={`${cvtSpeed(weather.wind.speed, unit)} ${sl}`}
          sub={`${windDir(weather.wind.deg)} — ${weather.wind.deg}°`}
          bar={(weather.wind.speed / 20) * 100} />
        <StatCard label="Pressure"   value={`${weather.main.pressure} hPa`} />
        <StatCard label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
        <StatCard label="Sunrise"    value={fmtTime(weather.sys.sunrise)} />
        <StatCard label="Sunset"     value={fmtTime(weather.sys.sunset)} />
        <StatCard label="Cloud Cover" value={`${weather.clouds.all}%`}
          bar={weather.clouds.all} barColor="linear-gradient(90deg,#94a3b8,#6b7fa8)" />
        <StatCard label="Sea Level"
          value={`${weather.main.sea_level ?? weather.main.grnd_level ?? '—'} hPa`} />
      </div>
    </div>
  )
}

function ForecastPanel({ forecast, unit }) {
  if (!forecast.length) return null
  const ul = unitLabel(unit)
  return (
    <div className="card">
      <div className="section-label">5-Day Forecast</div>
      <div className="forecast-row">
        {forecast.map((day, i) => (
          <div className="day-card" key={i}>
            <div className="day-name">{dayName(day.dt)}</div>
            <div className="day-icon">
              <img
                src={getIconUrl(day.weather[0].icon)}
                alt={day.weather[0].description}
                width={48} height={48}
              />
            </div>
            <div className="day-temps">
              {cvt(day.main.temp_max, unit)}&deg;
              <span className="day-lo"> / {cvt(day.main.temp_min, unit)}&deg;</span>
            </div>
            <div className="day-desc">{cap(day.weather[0].description)}</div>
            <div className="day-hum">RH {day.main.humidity}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card">
      <div className="empty">
        <div className="empty-icon">[ WX ]</div>
        <div className="empty-title">Enter a city to fetch weather data</div>
        <div className="empty-sub">Current conditions · 5-day forecast · Wind, humidity, pressure</div>
        <div className="steps">
          <div className="step"><span className="step-num">1</span> Get a free key at openweathermap.org</div>
          <div className="step"><span className="step-num">2</span> Paste it in the API Key field above</div>
          <div className="step"><span className="step-num">3</span> Type any city and press Search, or use Locate</div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [apiKey, setApiKey] = useState(ENV_KEY)
  const [city,   setCity]   = useState('')
  const [unit,   setUnit]   = useState('metric')
  const [now,    setNow]    = useState(new Date())
  const styleInjected = useRef(false)

  // Inject global CSS once
  useEffect(() => {
    if (styleInjected.current) return
    const tag = document.createElement('style')
    tag.textContent = STYLES
    document.head.appendChild(tag)
    styleInjected.current = true
  }, [])

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const { weather, forecast, loading, error, searchCity, searchLocation } = useWeather()

  const doSearch = () => searchCity(city, apiKey, unit)
  const doLocate = () => searchLocation(apiKey, unit)
  const onKeyDown = (e) => { if (e.key === 'Enter') doSearch() }

  const dateStr = now.toLocaleDateString('en', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
  const timeStr = now.toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })

  return (
    <div className="shell">
      <div className="aurora" />
      <div className="content">

        <h1 className="brand">Atmosphere</h1>

        <div className="datetime">
          <span className="pulse" />
          {dateStr} &middot; {timeStr}
        </div>

        {/* Search row */}
        <div className="search-row">
          <div className="field" style={{ flex: '0 0 auto', minWidth: 210 }}>
            <span className="field-icon">KEY</span>
            <input
              type="password"
              className="input input-key"
              placeholder="OpenWeatherMap API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="field">
            <span className="field-icon">SRC</span>
            <input
              type="text"
              className="input"
              placeholder="City — e.g. Nagpur, London, Tokyo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <button className="btn btn-primary" onClick={doSearch} disabled={loading || !apiKey || !city}>
            {loading ? <span className="spinner" /> : 'Search'}
          </button>
          <button className="btn btn-ghost" onClick={doLocate} disabled={loading} title="Use my location">
            Locate
          </button>
          <button
            className="btn btn-ghost btn-unit"
            onClick={() => setUnit((u) => u === 'metric' ? 'imperial' : 'metric')}
          >
            {unit === 'metric' ? '°C' : '°F'}
          </button>
        </div>

        <p className="hint">
          Free key: <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer">openweathermap.org/api</a>
          &nbsp;&middot;&nbsp;Store in <code style={{fontFamily:'var(--mono)',fontSize:'0.72rem'}}>VITE_OPENWEATHER_API_KEY</code> in .env to auto-fill
        </p>

        {error  && <div className="error" role="alert">{error}</div>}
        {loading && <div className="skeleton" aria-label="Loading…" />}

        {!loading && weather && (
          <>
            <WeatherCard weather={weather} unit={unit} />
            <ForecastPanel forecast={forecast} unit={unit} />
          </>
        )}

        {!loading && !weather && !error && <EmptyState />}

      </div>
    </div>
  )
}