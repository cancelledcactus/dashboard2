// weather.js
// Node >=18 or modern browsers for fetch support

// config
const LAT = 40.7675, LON = -73.8331;
const WEATHER_KEY = "zvL4ldbzkbXzBB1eWHkOApQ6iKnhBSUj";
const WEATHER_URL = "https://api.tomorrow.io/v4/weather/forecast";
const LOCAL_TZ = "America/New_York";

// exact commit path you gave (V2 small PNG icons)
const ICON_BASE = "https://raw.githubusercontent.com/Tomorrow-IO-API/tomorrow-weather-codes/51b9588fa598d7a8fcf26798854e0d74708abcc4/V2_icons/large/png/";

// Prioritized suffixes
const _SUFFIXES = [
  "clear_large@2x.png",
  "cloudy_large@2x.png",
  "mostly_clear_large@2x.png",
  "partly_cloudy_large@2x.png",
  "mostly_cloudy_large@2x.png",
  "fog_large@2x.png",
  "fog_light_large@2x.png",
  "fog_light_mostly_clear_large@2x.png",
  "fog_light_partly_cloudy_large@2x.png",
  "fog_light_mostly_cloudy_large@2x.png",
  "fog_mostly_clear_large@2x.png",
  "fog_partly_cloudy_large@2x.png",
  "fog_mostly_cloudy_large@2x.png",
  "drizzle_large@2x.png",
  "rain_large@2x.png",
  "rain_light_large@2x.png",
  "rain_heavy_large@2x.png",
  "rain_heavy_partly_cloudy_large@2x.png",
  "drizzle_mostly_clear_large@2x.png",
  "drizzle_partly_cloudy_large@2x.png",
  "drizzle_mostly_cloudy_large@2x.png",
  "rain_partly_cloudy_large@2x.png",
  "rain_mostly_clear_large@2x.png",
  "rain_mostly_cloudy_large@2x.png",
  "rain_heavy_mostly_clear_large@2x.png",
  "rain_heavy_mostly_cloudy_large@2x.png",
  "rain_light_mostly_clear_large@2x.png",
  "rain_light_partly_cloudy_large@2x.png",
  "rain_light_mostly_cloudy_large@2x.png",
  "snow_large@2x.png",
  "flurries_large@2x.png",
  "snow_light_large@2x.png",
  "snow_heavy_large@2x.png",
  "snow_light_mostly_clear_large@2x.png",
  "snow_light_partly_cloudy_large@2x.png",
  "snow_light_mostly_cloudy_large@2x.png",
  "snow_mostly_clear_large@2x.png",
  "snow_partly_cloudy_large@2x.png",
  "snow_mostly_cloudy_large@2x.png",
  "wintry_mix_large@2x.png",
  "flurries_mostly_clear_large@2x.png",
  "flurries_partly_cloudy_large@2x.png",
  "flurries_mostly_cloudy_large@2x.png",
  "snow_heavy_mostly_clear_large@2x.png",
  "snow_heavy_partly_cloudy_large@2x.png",
  "snow_heavy_mostly_cloudy_large@2x.png",
  "freezing_rain_drizzle_large@2x.png",
  "freezing_rain_large@2x.png",
  "freezing_rain_drizzle_partly_cloudy_large@2x.png",
  "freezing_rain_drizzle_mostly_clear_large@2x.png",
  "freezing_rain_drizzle_mostly_cloudy_large@2x.png",
  "freezing_rain_light_large@2x.png",
  "freezing_rain_heavy_large@2x.png",
  "freezing_rain_heavy_partly_cloudy_large@2x.png",
  "freezing_rain_light_partly_cloudy_large@2x.png",
  "freezing_rain_light_mostly_clear_large@2x.png",
  "freezing_rain_heavy_mostly_clear_large@2x.png",
  "freezing_rain_heavy_mostly_cloudy_large@2x.png",
  "freezing_rain_light_mostly_cloudy_large@2x.png",
  "ice_pellets_large@2x.png",
  "ice_pellets_heavy_large@2x.png",
  "ice_pellets_light_large@2x.png",
  "ice_pellets_partly_cloudy_large@2x.png",
  "ice_pellets_mostly_clear_large@2x.png",
  "ice_pellets_mostly_cloudy_large@2x.png",
  "ice_pellets_light_mostly_clear_large@2x.png",
  "ice_pellets_light_partly_cloudy_large@2x.png",
  "ice_pellets_light_mostly_cloudy_large@2x.png",
  "ice_pellets_heavy_mostly_clear_large@2x.png",
  "ice_pellets_heavy_partly_cloudy_large@2x.png",
  "ice_pellets_heavy_mostly_cloudy_large@2x.png",
  "tstorm_large@2x.png",
  "tstorm_mostly_clear_large@2x.png",
  "tstorm_mostly_cloudy_large@2x.png",
  "tstorm_partly_cloudy_large@2x.png",
  "unknown_large.png"
];

// cache to avoid repeated checks
const _icon_cache = new Map();

// convert code to label
function codeToLabel(code) {
  if (code === null || code === undefined) return "Unknown";
  let fname;
  if (_icon_cache.has(`${code}_true`)) {
    fname = _icon_cache.get(`${code}_true`).split("/").pop();
  } else if (_icon_cache.has(`${code}_false`)) {
    fname = _icon_cache.get(`${code}_false`).split("/").pop();
  } else if (_icon_cache.has(code)) {
    fname = _icon_cache.get(code).split("/").pop();
  } else {
    return `Code ${code}`;
  }
  let suffix = fname.split("_").slice(1).join("_");
  return suffix.replace("_large@2x.png", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// check if URL exists
async function tryUrl(url, timeout = 4000) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (e) {
    return false;
  }
}

// get icon url for weather code
async function getIconUrlForCode(code, isNight = false, isDay = false) {
  if (code === null || code === undefined) return ICON_BASE + "10001_clear_large@2x.png";

  const cacheKey = `${code}_${isNight}`;
  if (_icon_cache.has(cacheKey)) return _icon_cache.get(cacheKey);

  let codeStr = String(code);
  let candidates = [];

  
  if (codeStr.length === 4) {
    const baseNight = `${codeStr}1`;
    const baseDay = `${codeStr}0`;

    if (isNight) {
      candidates = [baseNight, baseDay];
    } else if (isDay) {
      candidates = [baseDay, baseNight];
    } else {
      // fallback if neither is explicitly set
      candidates = [baseDay, baseNight];
    }
  } else {
    candidates = [codeStr];
  }

  for (const base of candidates) {
    for (const suffix of _SUFFIXES) {
      const url = ICON_BASE + `${base}_${suffix}`;
      if (await tryUrl(url)) {
        _icon_cache.set(cacheKey, url);
        return url;
      }
    }
    for (const alt of [`${base}.png`, `${base}_large@2x.png`]) {
      const url = ICON_BASE + alt;
      if (await tryUrl(url)) {
        _icon_cache.set(cacheKey, url);
        return url;
      }
    }
  }

  const fallback = ICON_BASE + "10001_clear_large@2x.png";
  _icon_cache.set(cacheKey, fallback);
  return fallback;
}

// convert ISO to local datetime
function isoToLocal(dtIso) {
  if (!dtIso) return null;
  try {
    const dt = new Date(dtIso);
    return dt.toLocaleString("en-US", { timeZone: LOCAL_TZ });
  } catch {
    return null;
  }
}

// main getWeather function
export async function getWeather() {
  try {
    const params = new URLSearchParams({
      apikey: WEATHER_KEY,
      location: `${LAT},${LON}`,
      units: "imperial"
    });

    const r = await fetch(`${WEATHER_URL}?${params.toString()}`, { timeout: 12000 });
    const data = await r.json();

    const timelines = data.timelines || {};
    const hourlyRaw = (timelines.hourly || []).slice(0, 14);
    const dailyRaw = timelines.daily || [];

    let iconSunrise = null, iconSunset = null;
    if (dailyRaw.length) {
      const todayVals = dailyRaw[0].values || {};
      iconSunrise = isoToLocal(todayVals.sunriseTime);
      iconSunset = isoToLocal(todayVals.sunsetTime);
    }

    const hourly = [];
    for (const h of hourlyRaw) {
      const tkey = h.startTime || h.time;
      const vals = h.values || {};
      const code = vals.weatherCode;
      const temp = vals.temperature;
      const feels = vals.temperatureApparent;
      const rain = vals.precipitationProbability || 0;

      // Parse local time for this hourly entry
      const localTime = isoToLocal(tkey);
      const localDate = localTime ? new Date(localTime) : null;
      const timeStr = localDate ? localDate.toLocaleString("en-US", { hour: 'numeric', hour12: true }) : "";

      let isNight = false;
      let isDay = false;

      if (localDate) {
        // find which daily forecast matches this hour
        const matchingDay = dailyRaw.find(d => {
          const dDate = new Date(isoToLocal(d.time));
          return (
            dDate.getDate() === localDate.getDate() &&
            dDate.getMonth() === localDate.getMonth() &&
            dDate.getFullYear() === localDate.getFullYear()
          );
        });

        if (matchingDay) {
          const dayVals = matchingDay.values || {};
          const sunrise = new Date(isoToLocal(dayVals.sunriseTime));
          const sunset = new Date(isoToLocal(dayVals.sunsetTime));

          if (localDate >= sunset || localDate < sunrise) {
            isNight = true;
          } else {
            isDay = true;
          }
        }
      }

      
      const iconUrl = await getIconUrlForCode(code, isNight, isDay);

      hourly.push({ time: timeStr, temp, feels_like: feels, rain, code, icon: iconUrl });
    }

    let dailyAvg = null;
    if (dailyRaw.length) {
      const todayVals = dailyRaw[0].values || {};
      if (todayVals.temperatureAvg != null) dailyAvg = todayVals.temperatureAvg;
      else if (todayVals.temperatureMin != null && todayVals.temperatureMax != null) dailyAvg = (todayVals.temperatureMin + todayVals.temperatureMax) / 2;
    }

    // Sunrise/sunset via sunrise-sunset.org
    let labelSunrise = null, labelSunset = null;
    try {
      const sunResp = await fetch(`https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LON}&formatted=0`).then(r => r.json());
      labelSunrise = isoToLocal(sunResp.results.sunrise);
      labelSunset = isoToLocal(sunResp.results.sunset);
    } catch {}

    const now = new Date();
    let sunLabel = "Sun", sunTime = "N/A";
    if (labelSunrise && labelSunset) {
      const nowMs = now.getTime();
      if (new Date(labelSunrise).getTime() <= nowMs && nowMs <= new Date(labelSunset).getTime()) {
        sunLabel = "Sunset";
        sunTime = new Date(labelSunset).toLocaleString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });
      } else {
        sunLabel = "Sunrise";
        sunTime = new Date(labelSunrise).toLocaleString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    }

    let current;
    if (hourly.length) {
      const cur = hourly[0];
      current = {
        temp: cur.temp,
        feels_like: cur.feels_like,
        rain: cur.rain,
        icon: cur.icon,
        code: cur.code,
        label: codeToLabel(cur.code)
      };
    } else {
      const defaultIcon = await getIconUrlForCode(1000, false);
      current = { temp: null, feels_like: null, rain: 0, icon: defaultIcon, code: 1000, label: codeToLabel(1000) };
    }

    return { current, hourly, daily_avg: dailyAvg != null ? Math.round(dailyAvg * 10) / 10 : null, sun: { label: sunLabel, time: sunTime } };

  } catch (exc) {
    console.error("weather.getWeather error:", exc);
    const fallbackIcon = await getIconUrlForCode(1000, false);
    return { current: { temp: null, feels_like: null, rain: 0, icon: fallbackIcon, code: 1000 }, hourly: [], daily_avg: null, sun: { label: "Sun", time: "N/A" } };
  }
}
