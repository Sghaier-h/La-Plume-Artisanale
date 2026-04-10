/**
 * Social Auth Service - Service frontend pour l'authentification sociale
 */

import api from './api';

export const socialAuthService = {
  // Initier l'authentification avec un provider
  initiateAuth: (provider: string, state?: string) => {
    window.location.href = `/api/auth/social/${provider}${state ? `?state=${state}` : ''}`;
  },

  // Lier un compte social
  linkAccount: (provider: string) =>
    api.post(`/auth/social/link/${provider}`).then((response: any) => {
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    }),

  // Délier un compte social
  unlinkAccount: (provider: string) =>
    api.delete(`/auth/social/unlink/${provider}`),

  // Récupérer les comptes sociaux liés
  getLinkedAccounts: () =>
    api.get('/auth/social/accounts')
};
