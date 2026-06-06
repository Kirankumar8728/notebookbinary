import React from 'react';
import { generateRandomString, generateCodeChallenge } from './utils/pkce';

export default function Login() {
  const APP_ID = "32FjINZV8sXfdKQcVvnZf"; 
  const AFFILIATE_ID = "ryvn0GECp3Koq-Eo5YYlgWNd7ZgqdRLk"; // [7]
  const REDIRECT_URI = "https://notebookbinary2026.vercel.app/redirect"; 

  const handleAuth = async (isSignup = false) => {
    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('pkce_verifier', codeVerifier);

    const authUrl = new URL("https://auth.deriv.com/oauth2/auth"); // [1]
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", APP_ID);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    
    // Fix: Using strict scopes aligned with Deriv docs [4, 5]
    authUrl.searchParams.append("scope", "trade admin"); 
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256"); // [4]

    if (isSignup) {
      authUrl.searchParams.append("prompt", "registration"); // [6]
      authUrl.searchParams.append("utm_source", AFFILIATE_ID); // [6]
      
      // Fix: Generating a unique Session ID (GUID) for SIDC [5, 6]
      const sessionGuid = crypto.randomUUID(); 
      authUrl.searchParams.append("sidc", sessionGuid); 
      
      authUrl.searchParams.append("utm_medium", "affiliate"); // [6]
      authUrl.searchParams.append("utm_campaign", "bynex_telegram_bot"); 
    }

    window.location.href = authUrl.toString();
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Bynex Trader</h1>
      <button onClick={() => handleAuth(false)} style={{ margin: '10px', padding: '10px 20px' }}>Log In</button>
      <button onClick={() => handleAuth(true)} style={{ margin: '10px', padding: '10px 20px', background: '#ff444f', color: 'white', border: 'none' }}>
        Create Affiliate Account
      </button>
    </div>
  );
}