/**
 * Translation Service using Sarvam AI
 * Translates agricultural advisory content to user's selected language
 */

import axios from 'axios';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../../.env') });

// Language code mapping to Sarvam AI format
const LANGUAGE_MAP = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'kn': 'kn-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'mr': 'mr-IN',
  'gu': 'gu-IN',
  'bn': 'bn-IN',
  'ml': 'ml-IN',
  'pa': 'pa-IN',
  'or': 'or-IN',
  'as': 'as-IN',
  'ur': 'ur-IN'
};

class TranslationService {
  constructor() {
    this.apiUrl = 'https://api.sarvam.ai/translate';
    Object.defineProperty(this, 'apiKey', {
      get: () => process.env.SARVAM_API_KEY,
      configurable: true
    });
  }

  /**
   * Translate text to target language using Sarvam AI
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code
   * @returns {Promise<string>} Translated text
   */
  async translateText(text, targetLang = 'en') {
    if (!text || targetLang === 'en') return text;

    if (!this.apiKey) {
      logger.warn('SARVAM_API_KEY not set, skipping translation');
      return text;
    }

    // Sarvam has a ~1000 char limit — split long texts and rejoin
    if (text.length > 900) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let chunks = [];
      let current = '';
      for (const s of sentences) {
        if ((current + s).length > 900) {
          if (current) chunks.push(current.trim());
          current = s;
        } else {
          current += s;
        }
      }
      if (current.trim()) chunks.push(current.trim());

      const translated = await Promise.all(chunks.map(c => this.translateText(c, targetLang)));
      return translated.join(' ');
    }

    const targetLangCode = LANGUAGE_MAP[targetLang] || 'en-IN';

    const response = await axios.post(
      this.apiUrl,
      {
        input: text,
        source_language_code: 'en-IN',
        target_language_code: targetLangCode,
        speaker_gender: 'Male',
        mode: 'formal',
        model: 'mayura:v1',
        enable_preprocessing: true
      },
      {
        headers: { 'api-subscription-key': this.apiKey, 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    if (response.data?.translated_text) {
      return response.data.translated_text;
    }
    return text;
  }

  /**
   * Translate analysis results object - ALL fields
   * @param {Object} analysis - Analysis results object
   * @param {string} targetLang - Target language code
   * @returns {Promise<Object>} Translated analysis object
   */
  async translateAnalysisResults(analysis, targetLang = 'en') {
    if (!analysis || targetLang === 'en') return analysis;

    const T = (text) => text ? this.translateText(text, targetLang) : Promise.resolve(text);

    const translated = { ...analysis };

    // Core fields
    [translated.soil_type, translated.fertilizer, translated.nutrient_deficiency, translated.advice] =
      await Promise.all([
        T(analysis.soil_type),
        T(analysis.fertilizer),
        T(analysis.nutrient_deficiency),
        T(analysis.advice)
      ]);

    // Nutrient status
    if (analysis.ml_nutrient_status) {
      const ns = { ...analysis.ml_nutrient_status };
      [ns.nitrogen, ns.phosphorus, ns.potassium] = await Promise.all([
        T(ns.nitrogen), T(ns.phosphorus), T(ns.potassium)
      ]);
      translated.ml_nutrient_status = ns;
    }

    // Recommended crops
    if (analysis.recommended_crops?.length) {
      translated.recommended_crops = await Promise.all(analysis.recommended_crops.map(c => T(c)));
    }

    // Advisory report sections — translate ALL text content
    if (analysis.advisory_report?.sections) {
      const s = analysis.advisory_report.sections;
      const ts = {};

      if (s.farm_location) ts.farm_location = { ...s.farm_location, content: await T(s.farm_location.content) };

      if (s.soil_analysis) {
        ts.soil_analysis = { ...s.soil_analysis };
        ts.soil_analysis.soil_type = await T(s.soil_analysis.soil_type);
        ts.soil_analysis.texture = await T(s.soil_analysis.texture);
        ts.soil_analysis.fertility = await T(s.soil_analysis.fertility);
        ts.soil_analysis.ph_status = await T(s.soil_analysis.ph_status);
        ts.soil_analysis.organic_matter = await T(s.soil_analysis.organic_matter);
        ts.soil_analysis.interpretation = await T(s.soil_analysis.interpretation);
        ts.soil_analysis.summary = await T(s.soil_analysis.summary);
      }

      if (s.nutrient_status) {
        ts.nutrient_status = { ...s.nutrient_status };
        ts.nutrient_status.explanation = await T(s.nutrient_status.explanation);
        if (s.nutrient_status.deficiencies?.length) {
          ts.nutrient_status.deficiencies = await Promise.all(s.nutrient_status.deficiencies.map(d => T(d)));
        }
      }

      if (s.fertilizer_recommendation) {
        const fr = { ...s.fertilizer_recommendation };
        if (fr.schedule?.length) fr.schedule = await Promise.all(fr.schedule.map(step => T(step)));
        if (fr.organic_options?.length) fr.organic_options = await Promise.all(fr.organic_options.map(o => T(o)));
        if (fr.specific_recommendations?.length) fr.specific_recommendations = await Promise.all(fr.specific_recommendations.map(r => T(r)));
        if (fr.primary_nutrients) fr.primary_nutrients = await T(fr.primary_nutrients);
        if (fr.application_method) fr.application_method = await T(fr.application_method);
        ts.fertilizer_recommendation = fr;
      }

      if (s.crop_recommendation) {
        const cr = { ...s.crop_recommendation };
        cr.explanation = await T(cr.explanation);
        if (cr.top_crops?.length) {
          cr.top_crops = await Promise.all(cr.top_crops.map(async c => ({
            ...c, name: await T(c.name), reason: await T(c.reason)
          })));
        }
        ts.crop_recommendation = cr;
      }

      if (s.irrigation_advice) {
        const ia = { ...s.irrigation_advice };
        ia.explanation = await T(ia.explanation);
        ia.timing = await T(ia.timing);
        ia.frequency = await T(ia.frequency);
        ia.method = await T(ia.method);
        ia.water_requirement = await T(ia.water_requirement);
        ia.current_moisture = await T(ia.current_moisture);
        ia.recommendation = await T(ia.recommendation);
        if (ia.tips?.length) ia.tips = await Promise.all(ia.tips.map(tip => T(tip)));
        ts.irrigation_advice = ia;
      }

      if (s.risk_assessment) {
        const ra = { ...s.risk_assessment };
        ra.explanation = await T(ra.explanation);
        if (ra.risks?.length) {
          ra.risks = await Promise.all(ra.risks.map(async r => ({
            ...r, type: await T(r.type), description: await T(r.description), severity: await T(r.severity)
          })));
        }
        if (ra.mitigation?.length) ra.mitigation = await Promise.all(ra.mitigation.map(m => T(m)));
        ts.risk_assessment = ra;
      }

      if (s.climate_smart_practices) {
        const csp = { ...s.climate_smart_practices };
        csp.explanation = await T(csp.explanation);
        if (csp.practices?.length) {
          csp.practices = await Promise.all(csp.practices.map(async p => ({
            ...p,
            practice: await T(p.practice),
            benefit: await T(p.benefit),
            implementation: await T(p.implementation)
          })));
        }
        ts.climate_smart_practices = csp;
      }

      if (s.vegetation_status) {
        ts.vegetation_status = { ...s.vegetation_status, advice: await T(s.vegetation_status.advice) };
      }

      translated.advisory_report = { ...analysis.advisory_report, sections: { ...s, ...ts } };
    }

    // Soil health card recommendations
    if (analysis.soil_health_card?.recommendations?.length) {
      translated.soil_health_card = {
        ...analysis.soil_health_card,
        recommendations: await Promise.all(analysis.soil_health_card.recommendations.map(r => T(r)))
      };
    }

    return translated;
  }
}

export default new TranslationService();
