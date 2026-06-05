import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [balance, setBalance] = useState("Loading...");
  const [currentTick, setCurrentTick] = useState("Waiting for data...");
  const [ws, setWs] = useState(null);
  const [tradeStatus, setTradeStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('deriv_token');
    if (!token) return;
    
    const connectDeriv = async () => {
      try {
        // 1. Get Accounts via REST API
        const accRes = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const accountData = await accRes.json();
        if (!accountData || accountData.length === 0) throw new Error("No accounts found");
        const account = accountData; 

        // 2. Generate OTP for WebSocket
        const otpRes = await fetch(`https://api.derivws.com/trading/v1/options/accounts/${account.id}/otp`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const { otp } = await otpRes.json();

        // 3. Connect to Authenticated WebSocket
        const websocket = new WebSocket(`wss://api.derivws.com/trading/v1/options/ws/real?otp=${otp}`);
        setWs(websocket);

        websocket.onopen = () => {
          // Subscribe to balance
          websocket.send(JSON.stringify({ balance: 1, subscribe: 1, req_id: 1 }));
          
          // Subscribe to live tick stream (Volatility 10 Index)
          websocket.send(JSON.stringify({ ticks: "R_10", subscribe: 1, req_id: 2 }));

          // Keep connection alive
          setInterval(() => websocket.send(JSON.stringify({ ping: 1 })), 30000);
        };

        websocket.onmessage = (msg) => {
          const data = JSON.parse(msg.data);
          
          if (data.msg_type === 'balance') setBalance(data.balance.balance);
          if (data.msg_type === 'tick') setCurrentTick(data.tick.quote);
          if (data.error) setTradeStatus(`Error: ${data.error.message}`);
          
          // Handle Proposal Responses
          if (data.msg_type === 'proposal' && !data.error) {
            setTradeStatus(`Proposal received! Buying for $${data.proposal.ask_price}...`);
            websocket.send(JSON.stringify({
              buy: data.proposal.id,
              price: data.proposal.ask_price,
              req_id: 4
            }));
          }

          // Handle Buy Success
          if (data.msg_type === 'buy' && !data.error) {
            setTradeStatus(`Trade Successful! Contract ID: ${data.buy.contract_id} | Buy Price: $${data.buy.buy_price}`);
          }
        };
      } catch (err) {
        console.error(err);
        setTradeStatus("Failed to connect to Deriv.");
      }
    };
    
    connectDeriv();
    
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const placeTrade = (type) => {
    if (!ws) return;
    setTradeStatus(`Requesting ${type} proposal...`);
    
    ws.send(JSON.stringify({
      proposal: 1,
      contract_type: type, 
      currency: "USD",
      underlying_symbol: "R_10",
      amount: 10,
      basis: "stake",
      duration: 5,
      duration_unit: "t", 
      req_id: 3 
    }));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Balance: ${balance}</h2>
      
      <div style={{ height: '150px', border: '1px solid #ccc', margin: '20px 0', padding: '10px', background: '#f9f9f9' }}>
         <h3>Live Market (R_10):</h3>
         <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{currentTick}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => placeTrade('CALL')} style={{ padding: '15px 30px', background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>Rise (CALL)</button>
        <button onClick={() => placeTrade('PUT')} style={{ padding: '15px 30px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>Fall (PUT)</button>
      </div>

      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Status: {tradeStatus}</p>
    </div>
  );
}