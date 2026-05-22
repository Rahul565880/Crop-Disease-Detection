const express = require('express');
const router = express.Router();
const axios = require('axios');

const LANG = 'en';
const TEMP_UNIT = 'celsius';

router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    let latitude, longitude, city;

    if (lat && lon) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    } else {
      const ipRes = await axios.get('https://ipapi.co/json/', { timeout: 5000 });
      latitude = ipRes.data.latitude;
      longitude = ipRes.data.longitude;
      city = ipRes.data.city || ipRes.data.country_name || 'Unknown';
    }

    if (!latitude || !longitude) {
      return res.json({
        city: city || 'Unknown',
        temp: 28,
        humidity: 65,
        condition: 'clear',
        risk: 'low',
        riskLevel: 'Low Risk',
        riskMsg: 'Weather conditions are favorable for your crops.',
        source: 'fallback'
      });
    }

    const metaRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search`, {
      params: { name: `${latitude},${longitude}`, count: 1, language: LANG, format: 'json' },
      timeout: 5000
    });
    if (!city && metaRes.data.results && metaRes.data.results.length > 0) {
      city = metaRes.data.results[0].name || 'Unknown';
    }

    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude,
        longitude,
        current: ['temperature_2m', 'relative_humidity_2m', 'weather_code', 'precipitation'].join(','),
        temperature_unit: TEMP_UNIT === 'celsius' ? 'celsius' : 'fahrenheit',
        forecast_days: 1
      },
      timeout: 5000
    });

    const current = weatherRes.data.current;
    if (!current) {
      throw new Error('No weather data returned');
    }

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const weatherCode = current.weather_code;

    const condition = weatherCodeToCondition(weatherCode);

    let risk = 'low';
    let riskLevel = 'Low Risk';
    let riskMsg = 'Weather conditions are favorable for your crops.';

    if (humidity > 80 || (temp > 25 && humidity > 60)) {
      risk = 'high';
      riskLevel = 'High Risk';
      riskMsg = 'High humidity! Fungal diseases (Blight, Rust, Mildew) are likely to spread. Apply preventive fungicide sprays now.';
    } else if (humidity > 60 || (temp > 28 && humidity > 50)) {
      risk = 'medium';
      riskLevel = 'Moderate Risk';
      riskMsg = 'Monitor crops closely. Conditions favor early blight and leaf spot development.';
    }

    if (condition === 'rain' && humidity > 70) {
      risk = 'high';
      riskLevel = 'High Risk';
      riskMsg = 'Wet conditions + high humidity create ideal environment for fungal and bacterial diseases. Take preventive action.';
    }

    res.json({
      city: city || 'Unknown',
      temp,
      humidity,
      condition,
      risk,
      riskLevel: `${risk === 'high' ? 'High' : risk === 'medium' ? 'Moderate' : 'Low'} Risk`,
      riskMsg,
      source: 'open-meteo'
    });

  } catch (error) {
    console.error('Weather error:', error.message);
    res.json({
      city: 'Unknown',
      temp: 28,
      humidity: 65,
      condition: 'clear',
      risk: 'low',
      riskLevel: 'Low Risk',
      riskMsg: 'Weather data unavailable. Using default conditions.',
      source: 'fallback'
    });
  }
});

function weatherCodeToCondition(code) {
  if (code === 0) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code <= 48) return 'foggy';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  if (code <= 86) return 'snow';
  return 'rain';
}

module.exports = router;
