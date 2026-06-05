import React from 'react';
import { generateRandomString, generateCodeChallenge } from './utils/pkce';

export default function Login() {
  const APP_ID = "32FjINZV8sXfdKQcVvnZf"; // [1]
  const AFFILIATE_ID = "ryvn0GECp3Koq-Eo5YYlgWNd7ZgqdRLk"; // [1]
  
  // NOTE: Change this to your live Vercel URL once deployed
  const REDIRECT_URI = window.location.hostname === 'localhost' 
    ? "http://localhost:5173/redirect" 
    : "https://your-vercel-project.vercel.app/redirect"; 

  const handleAuth = async (isSignup = false) => {
    // 1. Generate PKCE parameters [2]
    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('pkce_verifier', codeVerifier);

    // 2. Build the authorization URL [5, 7]
    const authUrl = new URL("https://auth.deriv.com/oauth2/auth");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", APP_ID);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("scope", "trade account_manage"); // Requests trading and account creation permissions [8, 9]
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256"); // [8]

    // 3. Append Affiliate Tracking if Signing Up [6]
    if (isSignup) {
      authUrl.searchParams.append("prompt", "registration"); // Forces the signup form [6]
      authUrl.searchParams.append("utm_source", AFFILIATE_ID); // [1, 6]
      authUrl.searchParams.append("sidc", AFFILIATE_ID); // Maps session ID for tracking [1, 6]
      authUrl.searchParams.append("utm_medium", "affiliate"); // [6]
    }

    // Redirect user to Deriv [2]
    window.location.href = authUrl.toString();
  };

  return (
    <div>
      <h1>Bynex Trader</h1>
      <button onClick={() => handleAuth(false)}>Log In</button>
      <button onClick={() => handleAuth(true)}>Create Affiliate Account</button>
    </div>
  );
}