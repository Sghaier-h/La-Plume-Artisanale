/**
 * Social Auth Service - Service d'authentification via réseaux sociaux
 * Supporte OAuth pour Facebook, Google, LinkedIn, Twitter, etc.
 */

import axios from 'axios';
import { pool } from '../utils/db.js';

class SocialAuthService {
  constructor() {
    this.providers = {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scopes: ['openid', 'profile', 'email']
      },
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        userInfoUrl: 'https://graph.facebook.com/v18.0/me',
        scopes: ['email', 'public_profile']
      },
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
        scopes: ['openid', 'profile', 'email']
      },
      twitter: {
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        userInfoUrl: 'https://api.twitter.com/2/users/me',
        scopes: ['tweet.read', 'users.read']
      }
    };
    
    this.redirectUri = process.env.SOCIAL_REDIRECT_URI || 'http://localhost:5000/api/auth/social/callback';
  }

  /**
   * Génère l'URL d'authentification pour un provider
   */
  getAuthUrl(provider, state = null) {
    const config = this.providers[provider];
    if (!config || !config.clientId) {
      throw new Error(`Provider ${provider} non configuré`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      ...(state && { state })
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Échange le code d'autorisation contre un token d'accès
   */
  async exchangeCodeForToken(provider, code) {
    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Provider ${provider} non supporté`);
    }

    try {
      const params = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      });

      const response = await axios.post(config.tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Erreur échange token ${provider}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Récupère les informations utilisateur depuis le provider
   */
  async getUserInfo(provider, accessToken) {
    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Provider ${provider} non supporté`);
    }

    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`
      };

      // Facebook nécessite des champs spécifiques
      if (provider === 'facebook') {
        const fields = 'id,name,email,picture';
        const response = await axios.get(
          `${config.userInfoUrl}?fields=${fields}`,
          { headers }
        );
        
        return {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          picture: response.data.picture?.data?.url || response.data.picture,
          provider: 'facebook'
        };
      }

      // LinkedIn
      if (provider === 'linkedin') {
        const response = await axios.get(config.userInfoUrl, { headers });
        return {
          id: response.data.sub,
          email: response.data.email,
          name: `${response.data.given_name} ${response.data.family_name}`,
          picture: response.data.picture,
          provider: 'linkedin'
        };
      }

      // Twitter
      if (provider === 'twitter') {
        const response = await axios.get(config.userInfoUrl, { headers });
        return {
          id: response.data.data.id,
          email: response.data.data.username, // Twitter ne donne pas l'email par défaut
          name: response.data.data.name,
          picture: response.data.data.profile_image_url,
          provider: 'twitter'
        };
      }

      // Google (par défaut)
      const response = await axios.get(config.userInfoUrl, { headers });
      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        provider: 'google'
      };
    } catch (error) {
      console.error(`Erreur récupération infos ${provider}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Crée ou met à jour un utilisateur depuis les données du provider
   */
  async createOrUpdateUser(provider, userInfo) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await pool.query(
        `SELECT * FROM users 
         WHERE email = $1 OR (social_provider = $2 AND social_id = $3)`,
        [userInfo.email, provider, userInfo.id]
      );

      if (existingUser.rows.length > 0) {
        // Mettre à jour l'utilisateur existant
        const user = existingUser.rows[0];
        await pool.query(
          `UPDATE users 
           SET social_provider = $1, 
               social_id = $2, 
               social_picture = $3,
               last_login = NOW(),
               updated_at = NOW()
           WHERE id = $4`,
          [provider, userInfo.id, userInfo.picture, user.id]
        );
        return user;
      }

      // Créer un nouvel utilisateur
      const result = await pool.query(
        `INSERT INTO users (
          email, 
          nom, 
          prenom,
          social_provider, 
          social_id, 
          social_picture,
          role,
          actif,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *`,
        [
          userInfo.email,
          userInfo.name?.split(' ')[0] || userInfo.name,
          userInfo.name?.split(' ').slice(1).join(' ') || '',
          provider,
          userInfo.id,
          userInfo.picture,
          'USER', // Rôle par défaut
          true
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Erreur création/mise à jour utilisateur:', error);
      throw error;
    }
  }

  /**
   * Lie un compte social à un utilisateur existant
   */
  async linkSocialAccount(userId, provider, userInfo) {
    try {
      await pool.query(
        `UPDATE users 
         SET social_provider = $1, 
             social_id = $2, 
             social_picture = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [provider, userInfo.id, userInfo.picture, userId]
      );

      return true;
    } catch (error) {
      console.error('Erreur liaison compte social:', error);
      throw error;
    }
  }

  /**
   * Délie un compte social d'un utilisateur
   */
  async unlinkSocialAccount(userId, provider) {
    try {
      await pool.query(
        `UPDATE users 
         SET social_provider = NULL, 
             social_id = NULL, 
             social_picture = NULL,
             updated_at = NOW()
         WHERE id = $1 AND social_provider = $2`,
        [userId, provider]
      );

      return true;
    } catch (error) {
      console.error('Erreur déliaison compte social:', error);
      throw error;
    }
  }

  /**
   * Récupère les comptes sociaux liés d'un utilisateur
   */
  async getUserSocialAccounts(userId) {
    try {
      const result = await pool.query(
        `SELECT social_provider, social_id, social_picture 
         FROM users 
         WHERE id = $1 AND social_provider IS NOT NULL`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Erreur récupération comptes sociaux:', error);
      throw error;
    }
  }
}

export default new SocialAuthService();
