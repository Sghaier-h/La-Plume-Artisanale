/**
 * AI Service - Service frontend pour les fonctionnalités d'IA
 */

import api from './api';

export const aiService = {
  // Analyse de données
  analyzeData: (context: string, data: any, type: string) =>
    api.post('/ai/analyze', { context, data, type }),

  // Recommandations de produits
  getProductRecommendations: (productId: number, customerData?: any) =>
    api.get(`/ai/products/${productId}/recommendations`, {
      params: { customerData: customerData ? JSON.stringify(customerData) : undefined }
    }),

  // Prédiction des ventes
  predictSales: (period: string = 'month', productIds?: number[]) =>
    api.get('/ai/sales/predict', {
      params: {
        period,
        productIds: productIds ? productIds.join(',') : undefined
      }
    }),

  // Génération de contenu
  generateContent: (type: string, context: any, options?: any) =>
    api.post('/ai/generate-content', { type, context, options }),

  // Analyse de sentiment
  analyzeSentiment: (text: string) =>
    api.post('/ai/sentiment', { text }),

  // Chatbot
  chatBot: (message: string, context?: any) =>
    api.post('/ai/chatbot', { message, context }),

  // Fonctionnalités avancées
  advancedPredictiveAnalysis: (data: any, type: string = 'sales') =>
    api.post('/ai/advanced-predict', { data, type }),

  classifyData: (data: any, categories: string[] = []) =>
    api.post('/ai/classify', { data, categories }),

  detectAnomalies: (data: any, threshold: number = 0.8) =>
    api.post('/ai/detect-anomalies', { data, threshold }),

  clusterAnalysis: (data: any, numClusters?: number) =>
    api.post('/ai/cluster', { data, numClusters }),

  correlationAnalysis: (data: any) =>
    api.post('/ai/correlation', { data }),

  generateReport: (type: string, data: any, format: string = 'detailed') =>
    api.post('/ai/generate-report', { type, data, format }),

  testConnection: () =>
    api.get('/ai/test-connection'),

  getConfig: () =>
    api.get('/ai/config')
};
