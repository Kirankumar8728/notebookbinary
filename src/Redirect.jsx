import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const processLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const returnedState = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        alert("Authentication failed: " + error);
        return;
      }
      
      const storedState = sessionStorage.getItem('oauth_state');
      const verifier = sessionStorage.getItem('pkce_verifier');

      if (returnedState !== storedState) {
        alert("State mismatch error. Please try logging in again.");
        return; 
      }

      try {
        const res = await fetch('/api/exchangeToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code: code, 
            code_verifier: verifier, 
            redirect_uri: "https://notebookbinary2026.vercel.app/redirect" 
          })
        });

        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('deriv_token', data.access_token);
          navigate('/dashboard');
        } else {
          alert("Token exchange failed.");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred during authentication.");
      }
    };
    
    processLogin();
  }, [navigate]);

  return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Authenticating with Deriv...</h2>;
}