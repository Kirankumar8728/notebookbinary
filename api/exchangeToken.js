import React from 'react';
import { generateRandomString, generateCodeChallenge } from './utils/pkce';

export default function Login() {
  const APP_ID = "32FjINZV8sXfdKQcVvnZf"; 
  const AFFILIATE_ID = "ryvn0GECp3Koq-Eo5YYlgWNd7ZgqdRLk"; 
  
  // Use your exact live Vercel URL
  const REDIRECT_URI = "https://notebookbinary2026.vercel.app/redirect"; 

  const handleAuth = async (isSignup = false) => {
    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('pkce_verifier', codeVerifier);

    const authUrl = new URL("https://auth.deriv.com/oauth2/auth");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", APP_ID);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("scope", "trade account_manage"); 
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256");

    // Perfected Affiliate Tracking Flow
    if (isSignup) {
      authUrl.searchParams.append("prompt", "registration"); 
      authUrl.searchParams.append("utm_source", AFFILIATE_ID); 
      authUrl.searchParams.append("sidc", AFFILIATE_ID); 
      authUrl.searchParams.append("utm_medium", "affiliate"); 
      authUrl.searchParams.append("utm_campaign", "bynex_telegram_bot"); 
    }

    window.location.href = authUrl.toString();
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Bynex Trader</h1>
      <button onClick={() => handleAuth(false)}>Log In</button>
      <button onClick={() => handleAuth(true)}>Create Affiliate Account</button>
    </div>
  );
}