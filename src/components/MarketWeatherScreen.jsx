import { useState } from 'react';
import './MarketWeatherScreen.css';
import WeatherAnalytics from './WeatherAnalytics';
import CropMarketTrends from './CropMarketTrends';
import { t } from '../translations';

function MarketWeatherScreen({ language }) {
  const [activeTab, setActiveTab] = useState('weather'); // weather or market

  return (
    <div className="screen market-weather-screen">
      <div className="market-weather-header">
        <h1>{t('market_weather', language)}</h1>
      </div>

      <div className="tab-selector">
        <button
          className={`tab-btn ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          🌤️ {t('weather_analytics', language)}
        </button>
        <button
          className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          📊 {t('crop_market', language)}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'weather' && <WeatherAnalytics language={language} />}
        {activeTab === 'market' && <CropMarketTrends language={language} />}
      </div>
    </div>
  );
}

export default MarketWeatherScreen;
