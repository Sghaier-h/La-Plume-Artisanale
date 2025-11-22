// Middleware spécifique pour applications mobiles

export const detectMobile = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  
  req.isMobile = isMobile;
  req.isAndroid = isAndroid;
  req.isIOS = isIOS;
  
  next();
};

export const mobileRateLimit = (req, res, next) => {
  // Rate limiting plus permissif pour mobile
  if (req.isMobile) {
    // Logique de rate limiting adaptée
    return next();
  }
  next();
};

export const validateMobileToken = (req, res, next) => {
  // Validation spécifique pour tokens mobile
  if (req.isMobile && req.headers['x-mobile-app']) {
    // Vérifications supplémentaires si nécessaire
  }
  next();
};

