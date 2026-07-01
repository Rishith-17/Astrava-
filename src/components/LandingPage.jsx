import { useState } from 'react';
import { 
  Leaf, Camera, MapPin, BrainCircuit, Droplets, Globe, 
  Mic, Satellite, BarChart3, Shield, Zap, Users,
  ChevronRight, Star, ArrowRight, Cloud, Database
} from 'lucide-react';
import './LandingPage.css';

function LandingPage({ onEnterApp }) {
  const [email, setEmail] = useState('');

  const handleWaitlist = (e) => {
    e.preventDefault();
    // For now, just enter the app
    if (onEnterApp) onEnterApp();
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Leaf className="brand-icon" size={28} />
            <span className="brand-name">Astrava</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#technology">Technology</a>
            <a href="#impact">Impact</a>
          </div>
          <button className="btn-nav-cta" onClick={onEnterApp}>
            Launch App <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-container">
          <div className="hero-badge-landing">
            <Cloud size={16} />
            <span>Powered by AWS Cloud Infrastructure</span>
          </div>
          <h1 className="landing-hero-title">
            AI-Powered Agricultural
            <span className="gradient-text"> Intelligence</span>
            <br />for Every Farmer
          </h1>
          <p className="landing-hero-subtitle">
            Astrava combines machine learning, satellite imagery, and real-time data from 9 sources 
            to deliver personalized farming guidance in 13 Indian languages. 
            Empowering 140M+ Indian farmers with actionable insights.
          </p>
          <div className="hero-actions">
            <button className="btn-primary-landing" onClick={onEnterApp}>
              <Camera size={20} />
              Try Soil Analysis
            </button>
            <a href="#how-it-works" className="btn-secondary-landing">
              See How It Works <ChevronRight size={18} />
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">93%+</span>
              <span className="stat-label">ML Accuracy</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">9</span>
              <span className="stat-label">Data Sources</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">13</span>
              <span className="stat-label">Languages</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">&lt;30s</span>
              <span className="stat-label">Analysis Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Core Capabilities</span>
            <h2 className="section-title-landing">Everything a Farmer Needs, In One App</h2>
            <p className="section-subtitle">
              From soil analysis to market prices — comprehensive agricultural intelligence at your fingertips
            </p>
          </div>
          <div className="features-grid-landing">
            <div className="feature-card">
              <div className="feature-card-icon green">
                <BrainCircuit size={28} />
              </div>
              <h3>ML Soil Classification</h3>
              <p>Upload a soil image and our deep learning model classifies soil type with 93%+ accuracy in seconds</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon blue">
                <Satellite size={28} />
              </div>
              <h3>Satellite Imagery</h3>
              <p>Real-time NDVI analysis from Planet.com and ISRO Bhuvan for crop health monitoring</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon purple">
                <Mic size={28} />
              </div>
              <h3>Voice Assistant</h3>
              <p>Sarvam AI-powered voice interaction in 13 Indian languages with wake word detection</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon orange">
                <BarChart3 size={28} />
              </div>
              <h3>Market Intelligence</h3>
              <p>Real-time crop prices, market trends, and weather analytics for informed decisions</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon cyan">
                <Droplets size={28} />
              </div>
              <h3>Fertilizer Advisor</h3>
              <p>Personalized NPK recommendations, dosage calculations, and application schedules</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon pink">
                <Globe size={28} />
              </div>
              <h3>13 Languages</h3>
              <p>Full support for Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, and 7 more Indian languages</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="landing-section how-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title-landing">How Astrava Works</h2>
            <p className="section-subtitle">
              Three simple steps to transform farming decisions
            </p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Camera size={32} />
              </div>
              <h3>Capture Soil Image</h3>
              <p>Take a photo of your soil using your phone camera or upload an existing image</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={24} />
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Database size={32} />
              </div>
              <h3>AI Analyzes 9 Sources</h3>
              <p>Our ML model classifies soil type while 9 APIs fetch weather, satellite, and nutrient data</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={24} />
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Leaf size={32} />
              </div>
              <h3>Get Expert Guidance</h3>
              <p>Receive personalized crop recommendations, fertilizer plans, and irrigation advice in your language</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="landing-section tech-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Built on AWS</span>
            <h2 className="section-title-landing">Enterprise-Grade Cloud Architecture</h2>
            <p className="section-subtitle">
              Leveraging AWS infrastructure for reliability, scale, and security
            </p>
          </div>
          <div className="tech-grid">
            <div className="tech-card aws-card">
              <div className="tech-card-header">
                <Cloud size={24} />
                <h3>AWS Infrastructure</h3>
              </div>
              <ul className="tech-list">
                <li><Zap size={14} /> S3 + CloudFront for global CDN delivery</li>
                <li><Zap size={14} /> Lambda for serverless API processing</li>
                <li><Zap size={14} /> Auto-scaling for peak demand</li>
                <li><Zap size={14} /> 99.99% uptime SLA</li>
              </ul>
            </div>
            <div className="tech-card">
              <div className="tech-card-header">
                <BrainCircuit size={24} />
                <h3>AI/ML Pipeline</h3>
              </div>
              <ul className="tech-list">
                <li><Zap size={14} /> Deep learning soil classification</li>
                <li><Zap size={14} /> NLP for multi-language support</li>
                <li><Zap size={14} /> Computer vision for crop health</li>
                <li><Zap size={14} /> Real-time inference engine</li>
              </ul>
            </div>
            <div className="tech-card">
              <div className="tech-card-header">
                <Shield size={24} />
                <h3>Data Integration</h3>
              </div>
              <ul className="tech-list">
                <li><Zap size={14} /> ISRO Bhuvan satellite data</li>
                <li><Zap size={14} /> Government Soil Health Cards</li>
                <li><Zap size={14} /> FAO global agriculture data</li>
                <li><Zap size={14} /> Real-time weather APIs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="landing-section impact-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Market Opportunity</span>
            <h2 className="section-title-landing">Transforming Indian Agriculture</h2>
            <p className="section-subtitle">
              Addressing the needs of one of the world's largest agricultural economies
            </p>
          </div>
          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-number">140M+</div>
              <div className="impact-label">Indian Farming Households</div>
              <p className="impact-desc">Target market of smallholder farmers who lack access to expert agricultural advice</p>
            </div>
            <div className="impact-card">
              <div className="impact-number">$370B</div>
              <div className="impact-label">Indian Agriculture Market</div>
              <p className="impact-desc">India's agriculture sector contributing 18% to GDP with massive digitization potential</p>
            </div>
            <div className="impact-card">
              <div className="impact-number">30%</div>
              <div className="impact-label">Yield Improvement Potential</div>
              <p className="impact-desc">Data-driven recommendations can significantly improve crop yields and farm income</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-section cta-section">
        <div className="section-container">
          <div className="cta-card">
            <h2>Ready to Transform Farming with AI?</h2>
            <p>Join thousands of farmers already using Astrava for smarter agricultural decisions</p>
            <div className="cta-actions">
              <button className="btn-primary-landing large" onClick={onEnterApp}>
                <Camera size={22} />
                Launch Astrava App
              </button>
            </div>
            <div className="cta-trust">
              <div className="trust-item">
                <Shield size={16} />
                <span>No data stored on servers</span>
              </div>
              <div className="trust-item">
                <Zap size={16} />
                <span>Free to use</span>
              </div>
              <div className="trust-item">
                <Globe size={16} />
                <span>Works offline (PWA)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Leaf size={24} />
            <span>Astrava</span>
            <p className="footer-tagline">Agricultural Intelligence Platform</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#technology">Technology</a>
            </div>
            <div className="footer-col">
              <h4>Data Sources</h4>
              <span>ISRO Bhuvan</span>
              <span>SoilGrids (ISRIC)</span>
              <span>Govt Soil Health Cards</span>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <a href="https://github.com/MrSloopyCoder/Astrava">GitHub</a>
              <span>astrava@agricultural-ai.com</span>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Astrava · <a href="https://bhumimind.in" style={{color:'#10b981'}}>bhumimind.in</a> · Built with ❤️ for Indian Farmers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
