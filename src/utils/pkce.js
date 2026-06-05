// src/utils/pkce.js

// Generates a cryptographically random string (used for the code_verifier and state)
export const generateRandomString = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
};

// Hashes the verifier using SHA-256 and Base64Url encodes it (used for the code_challenge)
export const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert ArrayBuffer to Base64
  let base64String = btoa(String.fromCharCode(...new Uint8Array(digest)));
  
  // Make it Base64URL-safe by replacing + and / and removing =
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};