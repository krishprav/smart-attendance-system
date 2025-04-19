import { OAuth2Client } from 'google-auth-library';

// Create OAuth client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
);

// Google OAuth configuration
export const googleConfig = {
  client_id: process.env.GOOGLE_CLIENT_ID || '',
  client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  allowedDomains: ['iiitmanipur.ac.in'], // Restrict to college email domains
};

// Generate Google OAuth URL
export const getGoogleAuthURL = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: googleConfig.redirect_uri,
    client_id: googleConfig.client_id,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' '),
  };

  const queryString = new URLSearchParams(options);
  return `${rootUrl}?${queryString.toString()}`;
};

// Get tokens from Google
export const getTokens = async (code: string) => {
  const { tokens } = await client.getToken(code);
  return tokens;
};

// Get user profile from Google
export const getGoogleUser = async (accessToken: string) => {
  const response = await client.verifyIdToken({
    idToken: accessToken,
    audience: googleConfig.client_id,
  });
  
  const payload = response.getPayload();
  
  if (!payload) {
    throw new Error('Failed to get user info from Google');
  }
  
  return payload;
};

export default {
  googleConfig,
  getGoogleAuthURL,
  getTokens,
  getGoogleUser
};
