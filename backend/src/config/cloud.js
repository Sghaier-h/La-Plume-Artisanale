// Configuration Cloud/SaaS
export const cloudConfig = {
  // URLs
  apiUrl: process.env.API_URL || 'https://api.fouta-erp.com',
  frontendUrl: process.env.FRONTEND_URL || 'https://app.fouta-erp.com',
  
  // CORS pour applications mobiles
  allowedOrigins: [
    'https://app.fouta-erp.com',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:8100'
  ],
  
  // JWT pour mobile
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
    refreshExpiresIn: '30d',
    mobileExpiresIn: '90d' // Tokens plus longs pour mobile
  },
  
  // Rate limiting pour mobile
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Requêtes par IP
    mobileMax: 200 // Plus de requêtes pour mobile (sync)
  },
  
  // Upload pour photos
  upload: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    path: '/uploads'
  },
  
  // WebSocket pour temps réel
  socket: {
    pingInterval: 25000,
    pingTimeout: 60000,
    transports: ['websocket', 'polling']
  }
};

