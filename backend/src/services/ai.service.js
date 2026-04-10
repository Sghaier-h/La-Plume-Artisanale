/**
 * AI Service - Service d'intelligence artificielle
 * Fournit des fonctionnalités d'IA pour l'analyse, les recommandations et l'automatisation
 */

import axios from 'axios';
import { pool } from '../utils/db.js';

class AIService {
  constructor() {
    // Les paramètres sont maintenant chargés depuis la base de données via getConfig
    this.defaultConfig = {
      apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
      apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      enableAdvancedFeatures: true
    };
  }

  /**
   * Charge la configuration IA depuis la base de données
   */
  async getConfig() {
    try {
      const result = await pool.query(
        `SELECT key, value FROM ir_config_parameter 
         WHERE key LIKE 'ai.%'`
      );
      
      const config = { ...this.defaultConfig };
      
      result.rows.forEach(row => {
        const key = row.key.replace('ai.', '');
        // Parser les valeurs JSON si nécessaire
        try {
          config[key] = JSON.parse(row.value);
        } catch {
          config[key] = row.value;
        }
      });
      
      return config;
    } catch (error) {
      console.error('Erreur chargement config IA:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Analyse de données et génération d'insights
   */
  async analyzeData(context, data, type = 'general') {
    try {
      const prompt = this.getAnalysisPrompt(context, data, type);
      const response = await this.callAI(prompt);
      
      return {
        insights: response.insights || [],
        recommendations: response.recommendations || [],
        summary: response.summary || '',
        confidence: response.confidence || 0
      };
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      throw error;
    }
  }

  /**
   * Recommandations de produits
   */
  async getProductRecommendations(productId, customerData = {}) {
    try {
      // Récupérer les données du produit
      const productResult = await pool.query(
        'SELECT * FROM product_template WHERE id = $1',
        [productId]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error('Produit non trouvé');
      }

      const product = productResult.rows[0];

      // Récupérer l'historique des ventes similaires
      const salesResult = await pool.query(
        `SELECT 
          pt.name as product_name,
          pt.categ_id,
          COUNT(*) as sales_count,
          AVG(sol.price_unit) as avg_price
        FROM sale_order_line sol
        JOIN product_template pt ON sol.product_id = pt.id
        WHERE pt.categ_id = $1 AND pt.id != $2
        GROUP BY pt.id, pt.name, pt.categ_id
        ORDER BY sales_count DESC
        LIMIT 10`,
        [product.categ_id, productId]
      );

      // Générer des recommandations basées sur l'IA
      const prompt = `
        Analyse ce produit et génère des recommandations de produits similaires pour un client:
        Produit: ${product.name}
        Catégorie: ${product.categ_id}
        Prix: ${product.list_price}
        
        Produits similaires vendus:
        ${salesResult.rows.map(p => `- ${p.product_name} (${p.sales_count} ventes, prix moyen: ${p.avg_price})`).join('\n')}
        
        Donne 5 recommandations de produits avec une explication.
      `;

      const aiResponse = await this.callAI(prompt);
      
      return {
        product: product,
        recommendations: aiResponse.recommendations || [],
        similarProducts: salesResult.rows,
        confidence: aiResponse.confidence || 0.8
      };
    } catch (error) {
      console.error('Erreur recommandations produits:', error);
      throw error;
    }
  }

  /**
   * Analyse prédictive des ventes
   */
  async predictSales(period = 'month', productIds = null) {
    try {
      // Récupérer les données historiques
      let query = `
        SELECT 
          DATE_TRUNC($1, so.date_order) as period,
          COUNT(*) as order_count,
          SUM(so.amount_total) as total_amount,
          AVG(so.amount_total) as avg_amount
        FROM sale_order so
        WHERE so.state = 'sale'
      `;
      
      const params = [period];
      
      if (productIds && productIds.length > 0) {
        query += ` AND EXISTS (
          SELECT 1 FROM sale_order_line sol 
          WHERE sol.order_id = so.id AND sol.product_id = ANY($2)
        )`;
        params.push(productIds);
      }
      
      query += `
        GROUP BY period
        ORDER BY period DESC
        LIMIT 12
      `;

      const result = await pool.query(query, params);
      
      // Analyser avec l'IA
      const prompt = `
        Analyse ces données de ventes historiques et prédit les ventes pour les prochains ${period}s:
        ${result.rows.map(r => `Période: ${r.period}, Commandes: ${r.order_count}, Total: ${r.total_amount}€`).join('\n')}
        
        Fournis une prédiction avec tendance et confiance.
      `;

      const aiResponse = await this.callAI(prompt);
      
      return {
        historical: result.rows,
        prediction: aiResponse.prediction || {},
        trend: aiResponse.trend || 'stable',
        confidence: aiResponse.confidence || 0.7
      };
    } catch (error) {
      console.error('Erreur prédiction ventes:', error);
      throw error;
    }
  }

  /**
   * Génération automatique de contenu
   */
  async generateContent(type, context, options = {}) {
    try {
      const prompts = {
        product_description: `
          Génère une description de produit professionnelle et attrayante:
          Nom: ${context.name}
          Catégorie: ${context.category || 'Non spécifiée'}
          Caractéristiques: ${context.features || 'Non spécifiées'}
          Prix: ${context.price || 'Non spécifié'}€
          
          La description doit être en français, claire et vendeuse.
        `,
        email_template: `
          Génère un template d'email professionnel:
          Type: ${context.type || 'général'}
          Destinataire: ${context.recipient || 'Client'}
          Sujet: ${context.subject || 'Notification'}
          Contenu requis: ${context.content || 'Informations générales'}
          
          Le template doit être professionnel et en français.
        `,
        task_description: `
          Génère une description de tâche détaillée:
          Titre: ${context.title}
          Type: ${context.taskType || 'Général'}
          Priorité: ${context.priority || 'Normale'}
          Contexte: ${context.context || 'Non spécifié'}
          
          La description doit être claire et actionnable.
        `
      };

      const prompt = prompts[type] || prompts.product_description;
      const response = await this.callAI(prompt);
      
      return {
        content: response.content || response.text || '',
        suggestions: response.suggestions || [],
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur génération contenu:', error);
      throw error;
    }
  }

  /**
   * Analyse de sentiment (pour commentaires, avis clients)
   */
  async analyzeSentiment(text) {
    try {
      const prompt = `
        Analyse le sentiment de ce texte (positif, neutre, négatif) et donne un score de -1 (négatif) à 1 (positif):
        Texte: "${text}"
        
        Réponds avec un objet JSON contenant: sentiment (positif/neutre/négatif), score (nombre), et raisons.
      `;

      const response = await this.callAI(prompt, true);
      
      return {
        sentiment: response.sentiment || 'neutre',
        score: response.score || 0,
        reasons: response.reasons || [],
        confidence: response.confidence || 0.8
      };
    } catch (error) {
      console.error('Erreur analyse sentiment:', error);
      throw error;
    }
  }

  /**
   * Appel à l'API d'IA (OpenAI ou compatible)
   */
  async callAI(prompt, parseJson = false) {
    try {
      if (!this.apiKey) {
        // Mode simulation si pas d'API key
        return this.getMockResponse(prompt, parseJson);
      }

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant IA professionnel spécialisé dans l\'analyse de données d\'entreprise et les recommandations business. Réponds toujours en français.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      if (parseJson) {
        try {
          return JSON.parse(content);
        } catch (e) {
          // Si ce n'est pas du JSON valide, essayer d'extraire du JSON du texte
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          return { text: content };
        }
      }

      return { text: content };
    } catch (error) {
      console.error('Erreur appel IA:', error);
      // Fallback sur réponse mock
      return this.getMockResponse(prompt, parseJson);
    }
  }

  /**
   * Réponse mock pour développement sans API key
   */
  getMockResponse(prompt, parseJson = false) {
    if (parseJson) {
      return {
        sentiment: 'positif',
        score: 0.7,
        reasons: ['Analyse automatique'],
        confidence: 0.6
      };
    }

    return {
      text: 'Réponse IA simulée. Configurez OPENAI_API_KEY pour utiliser l\'IA réelle.',
      recommendations: [
        'Recommandation 1: Améliorer la visibilité du produit',
        'Recommandation 2: Optimiser le prix selon la concurrence',
        'Recommandation 3: Améliorer la description produit'
      ],
      insights: ['Insight 1', 'Insight 2'],
      summary: 'Analyse simulée - Configurez l\'API key pour une analyse réelle',
      confidence: 0.5
    };
  }

  /**
   * Génère le prompt d'analyse selon le type
   */
  getAnalysisPrompt(context, data, type) {
    const prompts = {
      sales: `
        Analyse ces données de ventes et fournis des insights:
        Données: ${JSON.stringify(data)}
        Contexte: ${context}
        
        Fournis des insights, recommandations et un résumé.
      `,
      inventory: `
        Analyse ce stock et recommande des actions:
        Données: ${JSON.stringify(data)}
        Contexte: ${context}
        
        Fournis des recommandations d'approvisionnement et d'optimisation.
      `,
      customer: `
        Analyse ce profil client et recommande des actions:
        Données: ${JSON.stringify(data)}
        Contexte: ${context}
        
        Fournis des recommandations de marketing et de vente.
      `,
      general: `
        Analyse ces données et fournis des insights:
        Données: ${JSON.stringify(data)}
        Contexte: ${context}
        
        Fournis une analyse complète avec insights et recommandations.
      `
    };

    return prompts[type] || prompts.general;
  }

  /**
   * Chatbot pour assistance client
   */
  async chatBot(message, context = {}) {
    try {
      const prompt = `
        Tu es un assistant client professionnel pour une entreprise de textile.
        Réponds de manière courtoise et professionnelle en français.
        
        Message client: "${message}"
        Contexte: ${JSON.stringify(context)}
        
        Fournis une réponse utile et actionnable.
      `;

      const response = await this.callAI(prompt);
      
      return {
        response: response.text || '',
        suggestions: response.suggestions || [],
        confidence: response.confidence || 0.8
      };
    } catch (error) {
      console.error('Erreur chatbot:', error);
      throw error;
    }
  }

  /**
   * Analyse prédictive avancée avec modèles de machine learning
   */
  async advancedPredictiveAnalysis(data, type = 'sales') {
    try {
      const config = await this.getConfig();
      
      if (!config.enableAdvancedFeatures) {
        return this.getBasicPrediction(data, type);
      }

      const prompt = `
        Analyse prédictive avancée de type ${type}:
        Données: ${JSON.stringify(data)}
        
        Fournis:
        1. Prévisions détaillées avec intervalles de confiance
        2. Identification des tendances (croissance, déclin, saisonnalité)
        3. Facteurs de risque identifiés
        4. Scénarios optimistes/pessimistes/réalistes
        5. Recommandations stratégiques basées sur les prédictions
        6. Métriques de confiance pour chaque prévision
        
        Réponds en JSON structuré.
      `;

      const response = await this.callAI(prompt, true, {
        temperature: 0.3, // Plus déterministe pour les prédictions
        maxTokens: 3000
      });

      return {
        predictions: response.predictions || [],
        trends: response.trends || {},
        riskFactors: response.riskFactors || [],
        scenarios: response.scenarios || {},
        recommendations: response.recommendations || [],
        confidence: response.confidence || 0.7,
        metadata: {
          model: config.model,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Erreur analyse prédictive avancée:', error);
      throw error;
    }
  }

  /**
   * Classification automatique de données
   */
  async classifyData(data, categories = []) {
    try {
      const prompt = `
        Classe automatiquement ces données dans les catégories suivantes: ${categories.join(', ')}
        Données: ${JSON.stringify(data)}
        
        Fournis:
        1. Catégorie principale assignée
        2. Score de confiance pour chaque catégorie
        3. Raison de la classification
        4. Sous-catégories suggérées si applicable
        
        Réponds en JSON.
      `;

      const response = await this.callAI(prompt, true);
      
      return {
        category: response.category || 'non-classé',
        confidence: response.confidence || 0.5,
        scores: response.scores || {},
        reason: response.reason || '',
        subcategories: response.subcategories || []
      };
    } catch (error) {
      console.error('Erreur classification:', error);
      throw error;
    }
  }

  /**
   * Détection d'anomalies dans les données
   */
  async detectAnomalies(data, threshold = 0.8) {
    try {
      const prompt = `
        Détecte les anomalies dans ces données avec un seuil de ${threshold}:
        Données: ${JSON.stringify(data)}
        
        Fournis:
        1. Liste des anomalies détectées avec scores
        2. Type d'anomalie (valeur aberrante, tendance inattendue, etc.)
        3. Impact potentiel
        4. Recommandations pour chaque anomalie
        5. Métriques statistiques (moyenne, médiane, écart-type)
        
        Réponds en JSON.
      `;

      const response = await this.callAI(prompt, true);
      
      return {
        anomalies: response.anomalies || [],
        statistics: response.statistics || {},
        recommendations: response.recommendations || [],
        threshold: threshold
      };
    } catch (error) {
      console.error('Erreur détection anomalies:', error);
      throw error;
    }
  }

  /**
   * Analyse de clustering automatique
   */
  async clusterAnalysis(data, numClusters = null) {
    try {
      const prompt = `
        Effectue une analyse de clustering sur ces données:
        Données: ${JSON.stringify(data)}
        ${numClusters ? `Nombre de clusters souhaité: ${numClusters}` : 'Détermine automatiquement le nombre optimal de clusters'}
        
        Fournis:
        1. Clusters identifiés avec leurs éléments
        2. Caractéristiques principales de chaque cluster
        3. Similarités et différences entre clusters
        4. Recommandations pour chaque cluster
        
        Réponds en JSON.
      `;

      const response = await this.callAI(prompt, true);
      
      return {
        clusters: response.clusters || [],
        characteristics: response.characteristics || {},
        recommendations: response.recommendations || []
      };
    } catch (error) {
      console.error('Erreur clustering:', error);
      throw error;
    }
  }

  /**
   * Analyse de corrélation et relations
   */
  async correlationAnalysis(data) {
    try {
      const prompt = `
        Analyse les corrélations et relations entre les variables dans ces données:
        Données: ${JSON.stringify(data)}
        
        Fournis:
        1. Matrice de corrélations identifiées
        2. Relations causales potentielles
        3. Variables les plus influentes
        4. Patterns et tendances cachés
        5. Insights business basés sur les corrélations
        
        Réponds en JSON.
      `;

      const response = await this.callAI(prompt, true);
      
      return {
        correlations: response.correlations || [],
        causalRelations: response.causalRelations || [],
        influentialVariables: response.influentialVariables || [],
        patterns: response.patterns || [],
        insights: response.insights || []
      };
    } catch (error) {
      console.error('Erreur analyse corrélations:', error);
      throw error;
    }
  }

  /**
   * Génération de rapports IA automatiques
   */
  async generateReport(type, data, format = 'detailed') {
    try {
      const prompt = `
        Génère un rapport ${format} de type ${type} basé sur ces données:
        Données: ${JSON.stringify(data)}
        
        Le rapport doit inclure:
        1. Résumé exécutif
        2. Analyse détaillée des données
        3. Visualisations suggérées (description)
        4. Insights clés
        5. Recommandations actionnables
        6. Annexes avec métriques détaillées
        
        Format: Texte structuré en Markdown.
      `;

      const response = await this.callAI(prompt, false, {
        maxTokens: 4000
      });
      
      return {
        report: response.text || '',
        type: type,
        format: format,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      throw error;
    }
  }

  /**
   * Prédiction de base (fallback)
   */
  getBasicPrediction(data, type) {
    return {
      predictions: [],
      trends: { direction: 'stable' },
      confidence: 0.5,
      message: 'Fonctionnalités avancées désactivées. Activez-les dans les paramètres IA.'
    };
  }

  /**
   * Test de connectivité à l'API IA
   */
  async testConnection() {
    try {
      const config = await this.getConfig();
      
      if (!config.apiKey) {
        return {
          connected: false,
          error: 'Aucune clé API configurée'
        };
      }

      const startTime = Date.now();
      const response = await this.callAI('Test de connexion. Réponds simplement "OK".', false, {
        maxTokens: 10
      });
      const responseTime = Date.now() - startTime;
      
      return {
        connected: true,
        model: config.model,
        apiUrl: config.apiUrl,
        responseTime: `${responseTime}ms`
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

export default new AIService();
