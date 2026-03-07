import { useState } from 'react';
import './AdvisoryReport.css';
import { t } from '../translations';

function AdvisoryReport({ report, onBack, language = 'en' }) {
  const [expandedSections, setExpandedSections] = useState({
    soil_analysis: true,
    nutrient_status: false,
    fertilizer_recommendation: false,
    crop_recommendation: false,
    irrigation_advice: false,
    risk_assessment: false,
    climate_smart_practices: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!report || !report.sections) {
    return null;
  }

  const { sections } = report;

  return (
    <div className="advisory-report">
      <div className="report-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1 className="report-title">🌾 {t('agricultural_advisory_report', language)}</h1>
      </div>

      {/* Farm Location */}
      <div className="report-section location-section">
        <div className="section-icon">📍</div>
        <div className="section-content">
          <h2>{t('farm_location', language)}</h2>
          <p className="location-text">{sections.farm_location.content}</p>
        </div>
      </div>

      {/* Soil Analysis */}
      <div className="report-section collapsible">
        <div className="section-header" onClick={() => toggleSection('soil_analysis')}>
          <div className="section-icon">🌍</div>
          <h2>{t('soil_analysis', language)}</h2>
          <span className="toggle-icon">{expandedSections.soil_analysis ? '▼' : '▶'}</span>
        </div>
        {expandedSections.soil_analysis && (
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Soil Type:</span>
                <span className="value">{sections.soil_analysis.soil_type}</span>
              </div>
              <div className="info-item">
                <span className="label">Texture:</span>
                <span className="value">{sections.soil_analysis.texture}</span>
              </div>
              <div className="info-item">
                <span className="label">Confidence:</span>
                <span className="value">{sections.soil_analysis.confidence}</span>
              </div>
              <div className="info-item">
                <span className="label">Fertility:</span>
                <span className={`value fertility-${sections.soil_analysis.fertility}`}>
                  {sections.soil_analysis.fertility}
                </span>
              </div>
              <div className="info-item">
                <span className="label">pH Status:</span>
                <span className="value">{sections.soil_analysis.ph_status}</span>
              </div>
              <div className="info-item">
                <span className="label">Organic Matter:</span>
                <span className="value">{sections.soil_analysis.organic_matter}</span>
              </div>
            </div>
            <p className="interpretation">{sections.soil_analysis.interpretation}</p>
          </div>
        )}
      </div>

      {/* Nutrient Status */}
      <div className="report-section collapsible">
        <div className="section-header" onClick={() => toggleSection('nutrient_status')}>
          <div className="section-icon">🧪</div>
          <h2>{t('nutrient_status', language)}</h2>
          <span className="toggle-icon">{expandedSections.nutrient_status ? '▼' : '▶'}</span>
        </div>
        {expandedSections.nutrient_status && (
          <div className="section-content">
            <div className="deficiency-tags">
              {sections.nutrient_status.deficiencies.map((def, idx) => (
                <span key={idx} className={`deficiency-tag ${def === 'None detected' ? 'none' : 'deficient'}`}>
                  {def}
                </span>
              ))}
            </div>
            <p className="explanation">{sections.nutrient_status.explanation}</p>
          </div>
        )}
      </div>

      {/* Fertilizer Recommendation */}
      <div className="report-section collapsible highlight">
        <div className="section-header" onClick={() => toggleSection('fertilizer_recommendation')}>
          <div className="section-icon">💊</div>
          <h2>{t('fertilizer_recommendation', language)}</h2>
          <span className="toggle-icon">{expandedSections.fertilizer_recommendation ? '▼' : '▶'}</span>
        </div>
        {expandedSections.fertilizer_recommendation && (
          <div className="section-content">
            <div className="npk-display">
              <span className="npk-label">NPK Ratio:</span>
              <span className="npk-value">{sections.fertilizer_recommendation.npk_ratio}</span>
            </div>
            <div className="dosage-grid">
              <div className="dosage-item">
                <span className="nutrient-name">Nitrogen (N)</span>
                <span className="nutrient-dose">{sections.fertilizer_recommendation.dosage.nitrogen}</span>
              </div>
              <div className="dosage-item">
                <span className="nutrient-name">Phosphorus (P)</span>
                <span className="nutrient-dose">{sections.fertilizer_recommendation.dosage.phosphorus}</span>
              </div>
              <div className="dosage-item">
                <span className="nutrient-name">Potassium (K)</span>
                <span className="nutrient-dose">{sections.fertilizer_recommendation.dosage.potassium}</span>
              </div>
            </div>
            
            <h3>Application Schedule</h3>
            <ol className="schedule-list">
              {sections.fertilizer_recommendation.schedule.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>

            <h3>Organic Alternatives</h3>
            <ul className="organic-list">
              {sections.fertilizer_recommendation.organic_options.map((option, idx) => (
                <li key={idx}>{option}</li>
              ))}
            </ul>

            {sections.fertilizer_recommendation.specific_recommendations.length > 0 && (
              <>
                <h3>Specific Recommendations</h3>
                <ul className="recommendations-list">
                  {sections.fertilizer_recommendation.specific_recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* Crop Recommendation */}
      <div className="report-section collapsible">
        <div className="section-header" onClick={() => toggleSection('crop_recommendation')}>
          <div className="section-icon">🌾</div>
          <h2>{t('crop_recommendation', language)}</h2>
          <span className="toggle-icon">{expandedSections.crop_recommendation ? '▼' : '▶'}</span>
        </div>
        {expandedSections.crop_recommendation && (
          <div className="section-content">
            <p className="explanation">{sections.crop_recommendation.explanation}</p>
            <div className="crops-detailed">
              {sections.crop_recommendation.top_crops.map((crop, idx) => (
                <div key={idx} className="crop-card">
                  <h4>{crop.name}</h4>
                  <p>{crop.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Irrigation Advice */}
      <div className="report-section collapsible">
        <div className="section-header" onClick={() => toggleSection('irrigation_advice')}>
          <div className="section-icon">💧</div>
          <h2>{t('irrigation_advice', language)}</h2>
          <span className="toggle-icon">{expandedSections.irrigation_advice ? '▼' : '▶'}</span>
        </div>
        {expandedSections.irrigation_advice && (
          <div className="section-content">
            <p className="current-status">{sections.irrigation_advice.current_moisture}</p>
            <p className="explanation">{sections.irrigation_advice.explanation}</p>
            
            <div className="irrigation-details">
              <div className="detail-item">
                <strong>Timing:</strong> {sections.irrigation_advice.timing}
              </div>
              <div className="detail-item">
                <strong>Frequency:</strong> {sections.irrigation_advice.frequency}
              </div>
              <div className="detail-item">
                <strong>Method:</strong> {sections.irrigation_advice.method}
              </div>
              <div className="detail-item">
                <strong>Water Requirement:</strong> {sections.irrigation_advice.water_requirement}
              </div>
            </div>

            <h3>Irrigation Tips</h3>
            <ul className="tips-list">
              {sections.irrigation_advice.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      <div className="report-section collapsible">
        <div className="section-header" onClick={() => toggleSection('risk_assessment')}>
          <div className="section-icon">⚠️</div>
          <h2>{t('risk_assessment', language)}</h2>
          <span className="toggle-icon">{expandedSections.risk_assessment ? '▼' : '▶'}</span>
        </div>
        {expandedSections.risk_assessment && (
          <div className="section-content">
            <p className="explanation">{sections.risk_assessment.explanation}</p>
            
            <h3>Identified Risks</h3>
            <div className="risks-list">
              {sections.risk_assessment.risks.map((risk, idx) => (
                <div key={idx} className={`risk-card severity-${risk.severity.toLowerCase()}`}>
                  <div className="risk-header">
                    <span className="risk-type">{risk.type}</span>
                    <span className="risk-severity">{risk.severity}</span>
                  </div>
                  <p className="risk-description">{risk.description}</p>
                </div>
              ))}
            </div>

            <h3>Mitigation Strategies</h3>
            <ul className="mitigation-list">
              {sections.risk_assessment.mitigation.map((strategy, idx) => (
                <li key={idx}>{strategy}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Climate-Smart Practices */}
      <div className="report-section collapsible">
        <div className="section-header" onClick={() => toggleSection('climate_smart_practices')}>
          <div className="section-icon">🌱</div>
          <h2>{t('climate_smart_practices', language)}</h2>
          <span className="toggle-icon">{expandedSections.climate_smart_practices ? '▼' : '▶'}</span>
        </div>
        {expandedSections.climate_smart_practices && (
          <div className="section-content">
            <p className="explanation">{sections.climate_smart_practices.explanation}</p>
            
            <div className="practices-list">
              {sections.climate_smart_practices.practices.map((practice, idx) => (
                <div key={idx} className="practice-card">
                  <h4>{practice.practice}</h4>
                  <p className="benefit"><strong>Benefit:</strong> {practice.benefit}</p>
                  <p className="implementation"><strong>How to implement:</strong> {practice.implementation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vegetation Status */}
      {sections.vegetation_status && (
        <div className="report-section">
          <div className="section-icon">🌿</div>
          <div className="section-content">
            <h2>{t('vegetation_status', language)}</h2>
            <div className="vegetation-info">
              <span>NDVI: {sections.vegetation_status.ndvi}</span>
              <span className={`health-badge health-${sections.vegetation_status.health}`}>
                {sections.vegetation_status.health}
              </span>
            </div>
            <p>{sections.vegetation_status.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvisoryReport;
