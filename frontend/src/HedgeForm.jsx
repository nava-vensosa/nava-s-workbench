import React, { useState, useEffect } from 'react';

export default function HedgeForm({ users, onBack }) {
  const [hedgeName, setHedgeName] = useState('');
  const [hedgemaster, setHedgemaster] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hedgeData = {
      name: hedgeName,
      hedgemaster,
      description,
      team_members: teamMembers,
      date,
      time,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hedges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hedgeData),
      });

      if (!response.ok) {
        throw new Error('Failed to create hedge');
      }

      setMessage('Hedge proposed successfully!');
      // Optionally reset the form
      setHedgeName('');
      setHedgemaster('');
      setDescription('');
      setTeamMembers([]);
      setDate('');
      setTime('');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <button onClick={onBack} style={{ marginBottom: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>← Back</button>
      <h3>Propose a Hedge</h3>
      {message && <p style={{ color: 'lime' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>What's the Name of your Hedge?</label>
          <input type="text" value={hedgeName} onChange={(e) => setHedgeName(e.target.value)} required />
        </div>
        <div>
          <label>Who's the Hedgemaster?</label>
          <select value={hedgemaster} onChange={(e) => setHedgemaster(e.target.value)} required>
            <option value="">Select Hedgemaster</option>
            {users.map(user => (
              <option key={user.userid} value={user.userid}>{user.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Write a Brief Description of the Hedge</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Select Any Critical Team Members from the List of Users</label>
          <select multiple value={teamMembers} onChange={(e) => setTeamMembers([...e.target.selectedOptions].map(option => option.value))}>
            {users.map(user => (
              <option key={user.userid} value={user.userid}>{user.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Select a Date & Time for your Hedge</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>Submit Hedge</button>
      </form>
    </div>
  );
}