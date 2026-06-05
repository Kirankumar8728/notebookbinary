// api/exchangeToken.js
export default async function handler(req, res) {
  // 1. Security Check: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  
  // 2. Extract the data sent by your React frontend
  const { code, code_verifier, redirect_uri } = req.body;
  
  // 3. Your specific Bynex Trader App ID
  const APP_ID = "32FjINZV8sXfdKQcVvnZf"; 

  try {
    // 4. Securely call Deriv's Token Endpoint
    const response = await fetch('https://auth.deriv.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: APP_ID,
        grant_type: 'authorization_code',
        code: code,
        code_verifier: code_verifier,
        redirect_uri: redirect_uri
      })
    });

    const data = await response.json();

    // 5. Check for Deriv errors (like an expired code)
    if (!response.ok) {
      throw new Error(data.error_description || 'Token exchange failed');
    }
    
    // 6. Send the final access token securely back to your React app
    res.status(200).json({ access_token: data.access_token });
    
  } catch (error) {
    // Return any errors cleanly
    res.status(500).json({ error: error.message });
  }
}