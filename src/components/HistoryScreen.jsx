import './HistoryScreen.css';

function HistoryScreen({ history, loading, onViewResult, onRefresh }) {
  if (loading) {
    return (
      <div className="screen history-screen">
        <h1 className="screen-title">Analysis History</h1>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="screen history-screen">
        <h1 className="screen-title">Analysis History</h1>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No Analysis Yet</h2>
          <p>Your soil analysis history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen history-screen">
      <div className="history-header">
        <h1 className="screen-title">Analysis History</h1>
        <button className="refresh-btn" onClick={onRefresh}>
          🔄
        </button>
      </div>
      
      <div className="history-stats">
        <div className="stat-card">
          <span className="stat-value">{history.length}</span>
          <span className="stat-label">Total Analyses</span>
        </div>
      </div>

      <div className="history-list">
        {history.map((item, idx) => (
          <div 
            key={item.id || idx} 
            className="history-card"
            onClick={() => onViewResult(item)}
          >
            <div className="history-icon">🌱</div>
            <div className="history-details">
              <h3>{item.soil_type}</h3>
              <p className="history-meta">
                pH: {item.ph} • {new Date(item.timestamp).toLocaleDateString()}
              </p>
              <div className="history-crops">
                {item.recommended_crops?.slice(0, 3).map((crop, i) => (
                  <span key={i} className="crop-badge">{crop}</span>
                ))}
              </div>
            </div>
            <div className="history-arrow">›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryScreen;
