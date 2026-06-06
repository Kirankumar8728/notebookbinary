export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  
  // Extract parameters sent from Redirect.jsx
  const { code, code_verifier, redirect_uri } = req.body;
  const APP_ID = "32FjINZV8sXfdKQcVvnZf"; // Your Deriv App ID [7]

  try {
    // Secure token exchange POST request to Deriv [1]
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
    if (!response.ok) {
      throw new Error(data.error_description || 'Token exchange failed');
    }
    
    // Return the token safely to the frontend
    res.status(200).json({ access_token: data.access_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}