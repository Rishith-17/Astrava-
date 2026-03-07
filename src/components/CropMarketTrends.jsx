import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './CropMarketTrends.css';
import { t } from '../translations';

function CropMarketTrends({ language }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewPeriod, setViewPeriod] = useState('7'); // 7, 30, 90 days
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Load popular crops on mount
    searchCrops('');
  }, []);

  const searchCrops = async (query) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/market/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.crops);
    } catch (error) {
      console.error('Crop search error:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchCrops(query);
  };

  const selectCrop = async (cropName) => {
    setSelectedCrop(cropName);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/api/market/price/${encodeURIComponent(cropName)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if data has error
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMarketData(data);
    } catch (error) {
      console.error('Market data fetch error:', error);
      alert(`Failed to fetch market data: ${error.message}`);
      setSelectedCrop(null);
    } finally {
      setLoading(false);
    }
  };

  const explainMarketTrend = async () => {
    if (!marketData || speaking) return;

    setSpeaking(true);

    try {
      // Generate explanation text
      const trend = marketData.priceChange > 0 ? 'increasing' : 'decreasing';
      const explanation = `Market analysis for ${marketData.crop}. Current price is ${marketData.currentPrice} rupees per quintal. Price is ${trend} by ${Math.abs(marketData.percentageChange)} percent. ${marketData.priceChange > 0 ? 'This is a good time to sell.' : 'Consider waiting for better prices.'}`;

      // Translate to user's language
      const translateResponse = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: explanation,
          targetLanguage: language
        })
      });

      const { translatedText } = await translateResponse.json();

      // Convert to speech
      const ttsResponse = await fetch('http://localhost:3001/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translatedText,
          language: language
        })
      });

      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setSpeaking(false);
      };

      await audio.play();

    } catch (error) {
      console.error('TTS error:', error);
      setSpeaking(false);
    }
  };

  const getFilteredData = () => {
    if (!marketData) return [];
    
    const days = parseInt(viewPeriod);
    return marketData.priceHistory.slice(-days);
  };

  return (
    <div className="crop-market-trends">
      {/* Search Section */}
      <div className="search-section">
        <h2>{t('search_crops', language)}</h2>
        <input
          type="text"
          className="search-input"
          placeholder={t('search_placeholder', language)}
          value={searchQuery}
          onChange={handleSearch}
        />
        
        <div className="crop-chips">
          {searchResults.slice(0, 10).map((crop) => (
            <button
              key={crop}
              className={`crop-chip ${selectedCrop === crop ? 'active' : ''}`}
              onClick={() => selectCrop(crop)}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Market Data Display */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('loading', language)}...</p>
        </div>
      )}

      {marketData && !loading && (
        <>
          {/* Price Summary */}
          <div className="price-summary">
            <div className="price-header">
              <h3>{marketData.crop}</h3>
              <span className="market-name">
                {marketData.market}, {marketData.district}
              </span>
              {marketData.variety && marketData.variety !== 'General' && (
                <span className="variety-badge">{marketData.variety}</span>
              )}
            </div>

            <div className="price-main">
              <div className="current-price">
                ₹{marketData.currentPrice}
                <span className="price-unit">/{marketData.unit}</span>
              </div>
              <div className={`price-change ${marketData.priceChange >= 0 ? 'positive' : 'negative'}`}>
                {marketData.priceChange >= 0 ? '▲' : '▼'} ₹{Math.abs(marketData.priceChange)}
                <span className="percentage">({marketData.percentageChange}%)</span>
              </div>
            </div>

            {/* Price Range */}
            <div className="price-range">
              <div className="range-item">
                <span className="range-label">Min:</span>
                <span className="range-value">₹{marketData.minPrice}</span>
              </div>
              <div className="range-item">
                <span className="range-label">Max:</span>
                <span className="range-value">₹{marketData.maxPrice}</span>
              </div>
              {marketData.arrivals > 0 && (
                <div className="range-item">
                  <span className="range-label">Arrivals:</span>
                  <span className="range-value">{marketData.arrivals} Qtl</span>
                </div>
              )}
            </div>

            {/* Data Source */}
            {marketData.source && (
              <div className="data-source">
                📊 Source: {marketData.source}
              </div>
            )}

            <button 
              className="btn btn-primary explain-btn"
              onClick={explainMarketTrend}
              disabled={speaking}
            >
              {speaking ? '🔊 Speaking...' : `🔊 ${t('explain_trend', language)}`}
            </button>
          </div>

          {/* Period Selector */}
          <div className="period-selector">
            <button 
              className={`period-btn ${viewPeriod === '7' ? 'active' : ''}`}
              onClick={() => setViewPeriod('7')}
            >
              7 {t('days', language)}
            </button>
            <button 
              className={`period-btn ${viewPeriod === '30' ? 'active' : ''}`}
              onClick={() => setViewPeriod('30')}
            >
              30 {t('days', language)}
            </button>
            <button 
              className={`period-btn ${viewPeriod === '90' ? 'active' : ''}`}
              onClick={() => setViewPeriod('90')}
            >
              90 {t('days', language)}
            </button>
          </div>

          {/* Price Chart */}
          <div className="chart-container">
            <h3>{t('price_trend', language)}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getFilteredData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={marketData.priceChange >= 0 ? '#10b981' : '#ef4444'}
                  strokeWidth={3}
                  name={t('price', language)}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Market Locations */}
          <div className="market-locations">
            <h3>{t('market_locations', language)}</h3>
            {marketData.marketLocations.map((location, idx) => (
              <div key={idx} className="location-item">
                <span className="location-name">📍 {location.name}</span>
                <span className="location-price">₹{location.price}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!selectedCrop && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>{t('select_crop_message', language)}</p>
        </div>
      )}
    </div>
  );
}

export default CropMarketTrends;
