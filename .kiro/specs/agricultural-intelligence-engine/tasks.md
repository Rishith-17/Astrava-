# Implementation Plan: Agricultural Intelligence Engine

## Overview

This plan implements a comprehensive agricultural intelligence system that integrates 6 external APIs (OpenCage Geocoder, ISRIC SoilGrids, Weather API, Sentinel Hub, Crop Health API, Fertilizer Dataset API) with the existing Farmer Soil Analyzer PWA. The system generates multi-language farming recommendations with voice narration, offline caching, and historical tracking capabilities.

**Implementation Language**: JavaScript/TypeScript (React frontend, Node.js/Express backend)

**Key Architecture Principles**:
- Parallel API requests with resilience (timeout, retry, caching)
- Graceful degradation when APIs fail
- IndexedDB for offline capability
- Property-based testing with fast-check for 61 correctness properties

## Tasks

- [ ] 1. Set up project infrastructure and dependencies
  - Install required npm packages: axios, idb, joi, winston, fast-check, msw
  - Configure environment variables for API keys (.env.example template)
  - Set up test framework configuration (Jest/Vitest with fast-check)
  - Create shared TypeScript interfaces for all data models
  - _Requirements: 16.1, 17.1_

- [ ] 2. Implement API service classes with resilience
  - [ ] 2.1 Create base API service class with timeout and retry logic
    - Implement fetchWithResilience() function with 10-second timeout
    - Add exponential backoff retry logic (max 2 retries)
    - Add error logging with timestamp and API identifier
    - _Requirements: 2.1, 2.2, 16.4_
  
  - [ ]* 2.2 Write property test for base API resilience
    - **Property 2: Error Logging Completeness**
    - **Validates: Requirements 2.1**
  
  - [ ] 2.3 Implement GeocoderService class
    - Create reverseGeocode() method with OpenCage API integration
    - Add response schema validation for LocationData
    - Include authentication header management
    - _Requirements: 1.1, 16.2_
  
  - [ ]* 2.4 Write property test for GeocoderService
    - **Property 1: API Response Schema Completeness**
    - **Property 47: Authentication Header Inclusion**
    - **Validates: Requirements 1.1, 16.2**
  
  - [ ] 2.5 Implement SoilGridsService class
    - Create getSoilProperties() method with ISRIC API integration
    - Parse and normalize soil property values (pH, nitrogen, organic carbon, clay, sand, CEC)
    - Add numeric range validation
    - _Requirements: 1.2, 17.2, 17.3_
  
  - [ ]* 2.6 Write property tests for SoilGridsService
    - **Property 51: Numeric Range Validation**
    - **Property 52: pH Range Validation**
    - **Validates: Requirements 17.2, 17.3**
  
  - [ ] 2.7 Implement WeatherService class
    - Create getWeatherData() method with Weather API integration
    - Parse current weather and 7-day forecast
    - Calculate 30-day rainfall accumulation
    - _Requirements: 1.3_
  
  - [ ]* 2.8 Write property test for WeatherService
    - **Property 1: API Response Schema Completeness**
    - **Validates: Requirements 1.3**
  
  - [ ] 2.9 Implement SatelliteService class
    - Create getSatelliteMetrics() method with Sentinel Hub OAuth2
    - Retrieve NDVI, vegetation stress index, soil moisture index
    - Add cloud coverage validation
    - _Requirements: 1.4, 17.4_
  
  - [ ]* 2.10 Write property tests for SatelliteService
    - **Property 53: NDVI Range Validation**
    - **Validates: Requirements 17.4**
  
  - [ ] 2.11 Implement CropHealthService class
    - Create getCropHealth() method with Crop Health API
    - Parse crop stress indicators and growth stage
    - _Requirements: 1.5_
  
  - [ ]* 2.12 Write property test for CropHealthService
    - **Property 1: API Response Schema Completeness**
    - **Validates: Requirements 1.5**
  
  - [ ] 2.13 Implement FertilizerService class
    - Create getFertilizerRecommendation() method with Fertilizer Dataset API
    - Support crop-specific NPK recommendations
    - _Requirements: 1.6_
  
  - [ ]* 2.14 Write property test for FertilizerService
    - **Property 1: API Response Schema Completeness**
    - **Validates: Requirements 1.6**

- [ ] 3. Implement Cache Manager with IndexedDB
  - [ ] 3.1 Create IndexedDB schema for apiCache store
    - Define cache entry structure with id, service, request_params, response_data, timestamp, expiry
    - Create indexes on service and expiry fields
    - Implement database migration from v1 to v2
    - _Requirements: 12.1_
  
  - [ ] 3.2 Implement CacheManager class
    - Create set() method to store API responses with timestamps
    - Create get() method to retrieve cached data with freshness check
    - Implement service-specific expiration policies (24h weather, 7d soil, 3d satellite)
    - Add cache cleanup for expired entries
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 3.3 Write property tests for CacheManager
    - **Property 38: Cache Storage with Timestamp**
    - **Property 39: Cached Data Fallback with Age Indicator**
    - **Property 60: Cache Round-Trip Schema Validation**
    - **Validates: Requirements 12.1, 12.5, 20.2**
  
  - [ ]* 3.4 Write unit tests for cache expiration
    - Test weather cache expires after 24 hours
    - Test soil cache expires after 7 days
    - Test satellite cache expires after 3 days
    - _Requirements: 12.2, 12.3, 12.4_

- [ ] 4. Implement Data Aggregator for parallel API requests
  - [ ] 4.1 Create DataAggregator class
    - Implement fetchAllData() method with Promise.all() for parallel requests
    - Integrate with CacheManager for cache-first strategy
    - Add schema validation for all API responses
    - Handle partial data availability (graceful degradation)
    - _Requirements: 2.2, 2.3, 14.2_
  
  - [ ] 4.2 Add API usage metrics logging
    - Log request count and response times per API
    - Implement rate limiting checks
    - _Requirements: 16.3, 16.5, 16.4_
  
  - [ ]* 4.3 Write property tests for DataAggregator
    - **Property 3: Invalid Data Rejection**
    - **Property 4: Data Availability Status Tracking**
    - **Property 48: Rate Limit Exponential Backoff**
    - **Property 49: API Usage Metrics Logging**
    - **Validates: Requirements 2.3, 2.5, 16.4, 16.5**
  
  - [ ]* 4.4 Write integration tests for parallel API execution
    - Test all 6 APIs succeed within 15 seconds
    - Test graceful degradation with 1-3 API failures
    - Test complete offline mode with cached data
    - _Requirements: 14.1, 14.3_

- [ ] 5. Checkpoint - Ensure all API services and caching work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Analysis Processor for fertility and risk calculations
  - [ ] 6.1 Create AnalysisProcessor class with fertility score calculation
    - Implement calculateFertilityScore() with weighted formula: N(40%) + OC(35%) + pH(25%)
    - Normalize nitrogen and organic carbon scores
    - Implement pH deviation scoring algorithm
    - Add fertility classification (poor/moderate/good/excellent)
    - Include calculation_details for transparency
    - _Requirements: 3.1, 3.2, 3.3, 19.1_
  
  - [ ]* 6.2 Write property tests for fertility score calculation
    - **Property 5: Fertility Score Calculation Correctness**
    - **Property 6: Fertility Score Range Constraint**
    - **Property 7: Optimal pH Score Assignment**
    - **Property 8: Extreme pH Flagging**
    - **Property 54: Calculation Details Transparency**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 19.1**
  
  - [ ] 6.3 Implement nutrient classification methods
    - Create classifyNitrogen() with threshold-based classification
    - Create classifyPhosphorus() with crop-specific thresholds
    - Create classifyPotassium() with crop-specific thresholds
    - Generate nutrient_status object with all three classifications
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 6.4 Write property tests for nutrient classification
    - **Property 9: Nitrogen Classification Thresholds**
    - **Property 10: Crop-Specific Nutrient Thresholds**
    - **Property 11: Nutrient Status Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
  
  - [ ] 6.5 Implement risk assessment methods
    - Create assessDroughtRisk() using rainfall and soil moisture
    - Create calculateCropStressProbability() using NDVI and nutrients
    - Generate risk_assessment object with all risk metrics
    - Include risk threshold values for transparency
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 19.4_
  
  - [ ]* 6.6 Write property tests for risk assessment
    - **Property 20: Low Rainfall Drought Risk**
    - **Property 21: Low Soil Moisture Risk Escalation**
    - **Property 22: Nutrient Deficiency Risk Classification**
    - **Property 23: Low NDVI Stress Probability**
    - **Property 24: Risk Assessment Completeness**
    - **Property 57: Risk Threshold Transparency**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 19.4**
  
  - [ ]* 6.7 Write unit tests for edge cases
    - Test fertility calculation with extreme pH values
    - Test nutrient classification at exact threshold boundaries
    - Test risk assessment with missing data
    - _Requirements: 3.4, 17.5_

- [ ] 7. Implement Recommendation Generator for farming advice
  - [ ] 7.1 Create RecommendationGenerator class with fertilizer recommendations
    - Implement generateFertilizerRecommendation() with NPK ratio calculation
    - Calculate dosage per acre based on deficiencies
    - Generate application schedule considering weather forecast
    - Add organic alternatives and cost estimates
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [ ]* 7.2 Write property tests for fertilizer recommendations
    - **Property 12: Fertilizer Type Matches Deficiencies**
    - **Property 13: Dosage Calculation Presence**
    - **Property 14: Rain-Aware Application Scheduling**
    - **Property 15: Application Schedule Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5**
  
  - [ ] 7.3 Implement crop suitability ranking
    - Create rankSuitableCrops() with multi-factor scoring algorithm
    - Calculate soil suitability score (35% weight)
    - Calculate climate match score (25% weight)
    - Calculate water requirement match score (20% weight)
    - Calculate market potential score (20% weight)
    - Sort crops by priority score and limit to top 5
    - Include scoring_factors for transparency
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 19.2_
  
  - [ ]* 7.4 Write property tests for crop recommendations
    - **Property 16: Crop Identification from Environmental Data**
    - **Property 17: Crop Priority Score Calculation**
    - **Property 18: Crop Ranking Order**
    - **Property 19: Crop List Size Limit**
    - **Property 55: Crop Scoring Factors Transparency**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5, 19.2**
  
  - [ ] 7.5 Implement irrigation planning
    - Create createIrrigationPlan() with soil moisture analysis
    - Determine immediate action (irrigate_now/delay/monitor)
    - Calculate irrigation volume based on soil texture and crop type
    - Generate 4-week irrigation schedule avoiding forecasted rain
    - Add water conservation tips
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 7.6 Write property tests for irrigation planning
    - **Property 25: Immediate Irrigation Recommendation**
    - **Property 26: High Moisture Irrigation Delay**
    - **Property 27: Forecast-Based Irrigation Timing**
    - **Property 28: Irrigation Volume Calculation**
    - **Property 29: Irrigation Frequency Inclusion**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
  
  - [ ] 7.7 Implement multi-language translation
    - Create translateRecommendations() method
    - Support 13 Indian languages with agricultural terminology
    - Add fallback to English with language_fallback flag
    - Preserve key agricultural terms during translation
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 7.8 Write property tests for translation
    - **Property 33: Multi-Language Farmer Advice**
    - **Property 34: Crop and Fertilizer Translation**
    - **Validates: Requirements 10.1, 10.3**
  
  - [ ]* 7.9 Write unit tests for recommendation edge cases
    - Test fertilizer recommendations with multiple deficiencies
    - Test crop ranking with tied priority scores
    - Test irrigation planning with no forecast data
    - _Requirements: 5.4, 6.4, 17.5_

- [ ] 8. Checkpoint - Ensure all analysis and recommendation logic works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Report Formatter with JSON schema validation
  - [ ] 9.1 Create ReportFormatter class
    - Implement formatAnalysisReport() to structure all sections
    - Add ISO 8601 timestamp formatting
    - Include data_sources_used array
    - Add metadata with confidence_level and methodology_notes
    - Include data_freshness indicators for cached data
    - Add errors and warnings arrays
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 12.6, 19.3, 19.5_
  
  - [ ] 9.2 Implement JSON schema validation
    - Define complete Analysis_Report JSON schema
    - Validate report structure before returning
    - Add round-trip validation (serialize/deserialize)
    - _Requirements: 9.5, 20.3_
  
  - [ ]* 9.3 Write property tests for report formatting
    - **Property 30: Analysis Report Section Completeness**
    - **Property 31: ISO 8601 Timestamp Format**
    - **Property 32: Data Sources Tracking**
    - **Property 35: Language Code Metadata**
    - **Property 40: Data Freshness Metadata**
    - **Property 56: Methodology Documentation**
    - **Property 58: Confidence Level Metadata**
    - **Property 61: JSON Round-Trip Integrity**
    - **Validates: Requirements 9.1, 9.2, 9.3, 10.5, 12.6, 19.3, 19.5, 20.3**
  
  - [ ]* 9.4 Write unit tests for error handling
    - Test report generation with missing sections
    - Test error array population on calculation failures
    - Test warnings for stale cached data
    - _Requirements: 9.4, 2.5_

- [ ] 10. Implement Historical Tracker for analysis storage
  - [ ] 10.1 Create IndexedDB schema for analysisHistory store
    - Define history entry structure with auto-increment id
    - Add indexes on timestamp, soil_type, language, location_lat_lon
    - _Requirements: 13.2_
  
  - [ ] 10.2 Implement HistoricalTracker class
    - Create store() method to save complete Analysis_Report
    - Implement FIFO eviction when limit of 50 reports is reached
    - Create getById() method for report retrieval
    - Create getByLocation() method with 1km radius spatial query
    - Add round-trip validation on storage
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 20.1_
  
  - [ ]* 10.3 Write property tests for historical tracking
    - **Property 41: Report Persistence**
    - **Property 42: Report Location and Timestamp Association**
    - **Property 43: Historical Report Storage Limit**
    - **Property 44: FIFO Report Eviction**
    - **Property 45: Spatial Report Retrieval**
    - **Property 59: Report Storage Round-Trip Integrity**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 20.1**
  
  - [ ]* 10.4 Write unit tests for historical queries
    - Test retrieval of reports within 1km radius
    - Test FIFO eviction with exactly 50 reports
    - Test empty results for locations with no history
    - _Requirements: 13.5_

- [ ] 11. Implement Voice Narrator integration with Sarvam AI
  - [ ] 11.1 Create VoiceNarrator class
    - Implement generateVoiceOutput() method using Sarvam AI SDK
    - Select voice model based on language code
    - Generate separate audio segments for fertilizer, crop, and irrigation recommendations
    - Add retry queue for failed synthesis
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ]* 11.2 Write property tests for voice narrator
    - **Property 36: Language-Specific Voice Model Selection**
    - **Property 37: Segmented Audio Generation**
    - **Validates: Requirements 11.2, 11.4**
  
  - [ ]* 11.3 Write unit tests for voice fallback
    - Test graceful handling when Sarvam AI is unavailable
    - Test retry queue functionality
    - _Requirements: 11.5_

- [ ] 12. Implement Intelligence Orchestrator to coordinate all components
  - [ ] 12.1 Create IntelligenceOrchestrator class
    - Implement analyze() method as main entry point
    - Coordinate DataAggregator, AnalysisProcessor, RecommendationGenerator, ReportFormatter
    - Add 15-second total processing time limit
    - Implement offline mode detection and fallback strategy
    - Add soil model output validation
    - _Requirements: 14.1, 15.1, 15.2, 15.3, 15.4, 17.1_
  
  - [ ]* 12.2 Write property tests for orchestrator
    - **Property 46: Offline Mode Flag**
    - **Property 50: Soil Model Output Validation**
    - **Validates: Requirements 15.3, 17.1**
  
  - [ ]* 12.3 Write integration tests for end-to-end flow
    - Test complete analysis with all APIs available
    - Test analysis with 1-3 API failures
    - Test offline mode with cached data only
    - Test offline mode with no cached data (regional defaults)
    - _Requirements: 15.1, 15.2, 15.4, 15.5_

- [ ] 13. Checkpoint - Ensure complete intelligence engine pipeline works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Enhance ResultScreen UI to display comprehensive reports
  - [ ] 14.1 Update ResultScreen component structure
    - Add sections for soil_analysis, nutrient_status, fertilizer_recommendation, crop_recommendation, risk_assessment, irrigation_plan
    - Implement expandable/collapsible sections for detailed data
    - Add loading states during analysis
    - _Requirements: 18.1, 18.6_
  
  - [ ] 14.2 Create visual indicators for fertility and nutrients
    - Add progress bar or gauge for Fertility_Score (0-100)
    - Add color-coded badges for nutrient levels (red=deficient, yellow=moderate, green=sufficient)
    - Display calculation_details in expandable tooltip
    - _Requirements: 18.1, 18.2_
  
  - [ ] 14.3 Create fertilizer recommendation card
    - Display fertilizer_type, NPK ratio, and dosage prominently
    - Show application_schedule as timeline or checklist
    - Add cost estimate and organic alternatives
    - _Requirements: 18.3_
  
  - [ ] 14.4 Create crop recommendation list
    - Display suitable_crops as ranked cards with priority scores
    - Show scoring_factors breakdown on expand
    - Add expected yield and growing season information
    - _Requirements: 18.4_
  
  - [ ] 14.5 Create risk assessment section
    - Display drought_risk, nutrient_deficiency_risk, crop_stress_probability
    - Add warning icons for high-risk conditions
    - Show risk_factors as bullet list
    - _Requirements: 18.5_
  
  - [ ] 14.6 Create irrigation plan section
    - Display immediate_action with clear call-to-action
    - Show irrigation schedule as calendar view
    - Add water conservation tips
    - _Requirements: 18.6_
  
  - [ ] 14.7 Add "Speak Recommendations" button
    - Integrate with VoiceNarrator to play audio segments
    - Add playback controls (play/pause/stop)
    - Show loading state during audio generation
    - _Requirements: 18.7_
  
  - [ ] 14.8 Add data quality indicators
    - Display data_sources_used with status icons
    - Show data_freshness for cached data
    - Display offline_mode banner when applicable
    - Show warnings for stale or missing data
    - _Requirements: 2.5, 12.6, 15.3_
  
  - [ ]* 14.9 Write UI component tests
    - Test ResultScreen renders all sections correctly
    - Test expandable sections toggle properly
    - Test voice button triggers audio playback
    - _Requirements: 18.1-18.7_

- [ ] 15. Update UploadScreen to trigger intelligence engine analysis
  - [ ] 15.1 Modify image upload handler
    - Call IntelligenceOrchestrator.analyze() after soil recognition
    - Pass image, location coordinates, and selected language
    - Handle loading state during 15-second analysis
    - Display error messages for critical failures
    - _Requirements: 14.1_
  
  - [ ] 15.2 Add offline mode detection
    - Check navigator.onLine before analysis
    - Show offline mode indicator to user
    - Explain reduced functionality in offline mode
    - _Requirements: 15.1, 15.3_
  
  - [ ]* 15.3 Write integration tests for upload flow
    - Test successful upload triggers intelligence analysis
    - Test offline mode shows appropriate messaging
    - _Requirements: 14.1, 15.1_

- [ ] 16. Implement backend API endpoints for intelligence engine
  - [ ] 16.1 Create POST /api/analyze endpoint
    - Accept image, latitude, longitude, language parameters
    - Call IntelligenceOrchestrator.analyze()
    - Return Analysis_Report JSON
    - Add request validation and error handling
    - _Requirements: 9.1, 17.1_
  
  - [ ] 16.2 Create GET /api/history endpoint
    - Accept location coordinates and radius parameters
    - Call HistoricalTracker.getByLocation()
    - Return array of historical reports
    - _Requirements: 13.5_
  
  - [ ] 16.3 Add API key management middleware
    - Load API keys from environment variables
    - Validate required keys are present on server startup
    - Add request logging for monitoring
    - _Requirements: 16.1, 16.5_
  
  - [ ]* 16.4 Write API endpoint tests
    - Test /api/analyze with valid inputs
    - Test /api/analyze with missing parameters
    - Test /api/history with location query
    - _Requirements: 9.1, 13.5_

- [ ] 17. Add error handling and user notifications
  - [ ] 17.1 Implement error notification system
    - Create notification component for critical/major/minor errors
    - Display data availability percentage for partial failures
    - Add dismissible warnings for stale data
    - _Requirements: 2.1, 2.4, 2.5_
  
  - [ ] 17.2 Add retry functionality
    - Add "Retry Analysis" button for failed requests
    - Implement background sync for offline queue
    - _Requirements: 15.5_
  
  - [ ]* 17.3 Write error handling tests
    - Test notification display for different error levels
    - Test retry button functionality
    - _Requirements: 2.1, 2.4_

- [ ] 18. Implement logging and monitoring
  - [ ] 18.1 Set up Winston logger
    - Configure structured logging with timestamps
    - Add log levels (error, warn, info, debug)
    - Log API performance metrics
    - Log data quality metrics
    - _Requirements: 2.1, 16.5_
  
  - [ ] 18.2 Add performance tracking
    - Track total analysis time
    - Track individual API response times
    - Track cache hit rates
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 18.3 Write logging tests
    - Test error logs contain required fields
    - Test performance metrics are recorded
    - _Requirements: 2.1, 16.5_

- [ ] 19. Create comprehensive documentation
  - [ ] 19.1 Document API service configuration
    - Create API_SETUP.md with instructions for obtaining API keys
    - Document environment variable requirements
    - Add troubleshooting guide for API failures
    - _Requirements: 16.1, 16.2_
  
  - [ ] 19.2 Document calculation methodologies
    - Add inline code comments explaining fertility score formula
    - Document crop priority scoring algorithm
    - Document risk assessment thresholds
    - _Requirements: 19.1, 19.2, 19.4_
  
  - [ ] 19.3 Create user guide
    - Document how to interpret fertility scores
    - Explain nutrient deficiency indicators
    - Provide guidance on following fertilizer recommendations
    - _Requirements: 19.1, 19.2_

- [ ] 20. Final integration and testing
  - [ ] 20.1 Run complete test suite
    - Execute all unit tests (target 85%+ coverage)
    - Execute all property tests (100 iterations minimum)
    - Execute all integration tests
    - _Requirements: All_
  
  - [ ] 20.2 Perform end-to-end testing
    - Test complete flow from image upload to voice output
    - Test with real API keys in staging environment
    - Test offline mode with cached data
    - Test historical tracking over multiple analyses
    - _Requirements: All_
  
  - [ ] 20.3 Performance validation
    - Verify analysis completes within 15 seconds with live APIs
    - Verify analysis completes within 3 seconds with cached data
    - Verify parallel API execution
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ] 20.4 Security audit
    - Verify API keys are not exposed in client code
    - Verify input validation on all endpoints
    - Test rate limiting functionality
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [ ] 21. Final checkpoint - Ensure complete system works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate 61 universal correctness properties from the design document
- Checkpoints ensure incremental validation at key milestones
- All code should include inline comments explaining complex algorithms
- Use TypeScript interfaces for type safety across all components
- Follow existing code style in the Farmer Soil Analyzer PWA codebase
