import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [balance, setBalance] = useState("Loading...");
  const [currentTick, setCurrentTick] = useState(null);
  const [ws, setWs] = useState(null);
  const [tradeStatus, setTradeStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('deriv_token');
    
    const connectDeriv = async () => {
      // 1. Get Accounts via REST API [17]
      const accRes = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const accountData = await accRes.json();
      const account = accountData; 

      // 2. Generate OTP for WebSocket Authentication [13, 18]
      const otpRes = await fetch(`https://api.derivws.com/trading/v1/options/accounts/${account.id}/otp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { otp, url } = await otpRes.json();

      // 3. Connect to Authenticated WebSocket [18, 19]
      const websocket = new WebSocket(url || `wss://api.derivws.com/trading/v1/options/ws/real?otp=${otp}`);
      setWs(websocket);

      websocket.onopen = () => {
        // Subscribe to balance [20]
        websocket.send(JSON.stringify({ balance: 1, subscribe: 1, req_id: 1 }));
        
        // Subscribe to live tick stream for the chart (e.g., Volatility 10 Index) [3, 21]
        websocket.send(JSON.stringify({ ticks: "R_10", subscribe: 1, req_id: 2 }));

        // Send periodic pings every 30s to keep connection alive [22]
        setInterval(() => websocket.send(JSON.stringify({ ping: 1 })), 30000); // [22, 23]
      };

      websocket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.msg_type === 'balance') setBalance(data.balance.balance);
        if (data.msg_type === 'tick') setCurrentTick(data.tick.quote); // [21]
        
        // Handle Proposal Responses [14, 15]
        if (data.msg_type === 'proposal') {
          setTradeStatus(`Got Proposal! Buying for ${data.proposal.ask_price}...`);
          // Immediately buy the contract using the proposal ID [16]
          websocket.send(JSON.stringify({
            buy: data.proposal.id,
            price: data.proposal.ask_price,
            req_id: 4 // [22]
          }));
        }

        // Handle Buy Success [16]
        if (data.msg_type === 'buy') {
          setTradeStatus(`Trade Successful! Contract ID: ${data.buy.contract_id}`);
        }
      };
    };
    connectDeriv();
  }, []);

  // Function to execute a Rise (CALL) or Fall (PUT) trade
  const placeTrade = (type) => {
    if (!ws) return;
    setTradeStatus(`Requesting ${type} proposal...`);
    
    // Request pricing proposal before buying [14]
    ws.send(JSON.stringify({
      proposal: 1,
      contract_type: type, // "CALL" or "PUT" [4]
      currency: "USD",
      underlying_symbol: "R_10",
      amount: 10,
      basis: "stake",
      duration: 5,
      duration_unit: "t", // 5 ticks duration [14]
      req_id: 3 // [22]
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Balance: ${balance}</h2>
      
      {/* Live Chart Placeholder */}
      <div style={{ height: '150px', border: '1px solid black', margin: '20px 0' }}>
         <h3>Live Chart (R_10): {currentTick}</h3>
         {/* You can integrate libraries like Recharts or TradingView here using currentTick */}
      </div>

      <button onClick={() => placeTrade('CALL')} style={{ background: 'green' }}>Rise (CALL)</button>
      <button onClick={() => placeTrade('PUT')} style={{ background: 'red' }}>Fall (PUT)</button>

      <p>Status: {tradeStatus}</p>
    </div>
  );
}