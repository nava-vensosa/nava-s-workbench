import React from 'react';

export default function Messages({ username, userid, messages, setMessages, users, onBack }) {
  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <button onClick={onBack} style={{ marginBottom: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>← Back</button>
      <h3>My Messages</h3>
      <ul>
        {messages
          .filter(m => m.to === userid)
          .map((m, i) => (
            <li key={i}><b>{m.from}</b>: {m.text} <span style={{color:"#aaa"}}>{m.date}</span></li>
          ))}
      </ul>
      <p>(Compose message UI coming soon!)</p>
    </div>
  );
}