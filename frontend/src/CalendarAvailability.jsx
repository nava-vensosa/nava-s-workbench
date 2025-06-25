import React, { useState } from 'react';

export default function HedgeForm({ onSubmit, onBack, users }) {
  const [name, setName] = useState('');
  const [hedgemaster, setHedgemaster] = useState('');
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const hedgeData = {
      name,
      hedgemaster,
      description,
      teamMembers,
      date,
      time,
    };
    onSubmit(hedgeData);
  };

  const handleTeamMemberChange = (userId) => {
    setTeamMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <button onClick={onBack} style={{ marginBottom: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>← Back</button>
      <h3>Propose a Hedge</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            What's the Name of your Hedge?
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Who's the Hedgemaster?
            <input type="text" value={hedgemaster} onChange={(e) => setHedgemaster(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Write a Brief Description of the Hedge
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Select Any Critical Team Members from the List of Users
            <select multiple value={teamMembers} onChange={(e) => handleTeamMemberChange(e.target.value)}>
              {users.map((user) => (
                <option key={user.userid} value={user.userid}>
                  {user.username}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Select a Date & Time for your Hedge
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
        </div>
        <button type="submit" style={{ marginTop: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>Submit Hedge</button>
      </form>
    </div>
  );
}