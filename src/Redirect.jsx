import React, { useEffect } from 'react';

export default function Redirect() {
  useEffect(() => {
    const processLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const returnedState = urlParams.get('state');
      
      const storedState = sessionStorage.getItem('oauth_state');
      const verifier = sessionStorage.getItem('pkce_verifier');

      // Verify the state to protect against CSRF attacks [2, 10]
      if (returnedState !== storedState) {
        alert("State mismatch error."); // [11]
        return; 
      }

      // Call our Vercel Serverless Function
      const redirectUri = window.location.hostname === 'localhost' 
        ? "http://localhost:5173/redirect" 
        : "https://your-vercel-project.vercel.app/redirect";

      const res = await fetch('/api/exchangeToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, code_verifier: verifier, redirect_uri: redirectUri })
      });

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('deriv_token', data.access_token);
        window.location.href = '/dashboard';
      }
    };
    processLogin();
  }, []);

  return <h2>Authenticating with Deriv...</h2>;
}