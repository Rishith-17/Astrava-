import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './WeatherAnalytics.css';
import { t } from '../translations';

function WeatherAnalytics({ language }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // hourly, daily, weekly
  const [locationName, setLocationName] = useState('');
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      let latitude, longitude;

      // Try to get user location
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        setUsingDefaultLocation(false);
      } catch (geoError) {
        console.warn('Geolocation denied or failed, using default location (Bangalore)');
        // Default to Bangalore, India if geolocation fails
        latitude = 12.9716;
        longitude = 77.5946;
        setLocationName('Bangalore, India (Default)');
        setUsingDefaultLocation(true);
      }

      // Fetch weather analytics
      const response = await fetch(
        `http://localhost:3001/api/weather/analytics?latitude=${latitude}&longitude=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(data);
      
      // Get location name if not using default
      if (!usingDefaultLocation && data.current.location) {
        setLocationName(`${data.current.location.city || ''}, ${data.current.location.state || ''}`);
      }
      
      setError(null);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="weather-analytics loading">
        <div className="spinner"></div>
        <p>{t('loading', language)}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-analytics error">
        <p>❌ {error}</p>
        <button className="btn btn-primary" onClick={fetchWeatherData}>
          {t('retry', language)}
        </button>
      </div>
    );
  }

  if (!weatherData) return null;

  const { current, forecast } = weatherData;

  return (
    <div className="weather-analytics">
      {/* Current Weather Summary */}
      <div className="weather-summary">
        <h2>{t('current_weather', language)}</h2>
        {locationName && (
          <div className="location-indicator">
            📍 {locationName}
            {usingDefaultLocation && (
              <span className="default-badge">Default Location</span>
            )}
          </div>
        )}
        <div className="weather-cards">
          <div className="weather-card">
            <div className="weather-icon">🌡️</div>
            <div className="weather-value">{current.temperature}°C</div>
            <div className="weather-label">{t('temperature', language)}</div>
          </div>
          <div className="weather-card">
            <div className="weather-icon">💧</div>
            <div className="weather-value">{current.humidity}%</div>
            <div className="weather-label">{t('humidity', language)}</div>
          </div>
          <div className="weather-card">
            <div className="weather-icon">🌧️</div>
            <div className="weather-value">{current.rainfall_30d}mm</div>
            <div className="weather-label">{t('rainfall', language)}</div>
          </div>
          <div className="weather-card">
            <div className="weather-icon">💨</div>
            <div className="weather-value">{forecast[0].windSpeed.toFixed(1)} km/h</div>
            <div className="weather-label">{t('wind_speed', language)}</div>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="view-selector">
        <button 
          className={`view-btn ${viewMode === 'daily' ? 'active' : ''}`}
          onClick={() => setViewMode('daily')}
        >
          {t('daily', language)}
        </button>
        <button 
          className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
          onClick={() => setViewMode('weekly')}
        >
          {t('weekly', language)}
        </button>
      </div>

      {/* Temperature Trend Chart */}
      <div className="chart-container">
        <h3>{t('temperature_trend', language)}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#ef4444" 
              strokeWidth={2}
              name={t('temperature', language)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity Trend Chart */}
      <div className="chart-container">
        <h3>{t('humidity_trend', language)}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name={t('humidity', language)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rainfall Forecast Chart */}
      <div className="chart-container">
        <h3>{t('rainfall_forecast', language)}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="rainfall" 
              fill="#10b981"
              name={t('rainfall', language)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Wind Speed Trend Chart */}
      <div className="chart-container">
        <h3>{t('wind_speed_trend', language)}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="windSpeed" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name={t('wind_speed', language)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default WeatherAnalytics;
