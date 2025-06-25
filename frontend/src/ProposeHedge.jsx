import React, { useState } from 'react';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'Dana' },
];

export default function ProposeHedge({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [hedgemasters, setHedgemasters] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [candidateMembers, setCandidateMembers] = useState(users);

  const handleAddMember = (user) => {
    setTeamMembers([...teamMembers, user]);
    setCandidateMembers(candidateMembers.filter(u => u.id !== user.id));
  };

  const handleRemoveMember = (user) => {
    setCandidateMembers([...candidateMembers, user]);
    setTeamMembers(teamMembers.filter(u => u.id !== user.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hedge = {
      title,
      date,
      time,
      hedgemasters: hedgemasters.split(',').map(s => s.trim()),
      description,
      teamMembers: teamMembers.map(u => u.name),
      interestedAttendees: [],
    };
    // POST to backend
    await fetch('/api/hedges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hedge),
    });
    if (onSubmit) onSubmit(hedge);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#181818',
        color: '#fff',
        padding: '2.5rem',
        borderRadius: '1.5rem',
        maxWidth: 900,
        margin: '2rem auto',
        fontFamily: 'sans-serif',
        boxShadow: '0 0 32px #000a',
        fontSize: '1.4rem',
      }}
    >
      <h2 style={{ marginBottom: '2.5rem', fontSize: '2.5rem' }}>Propose a Hedge</h2>
      <div style={{ display: 'flex', gap: '3rem', marginBottom: '2.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 12 }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              width: '100%',
              fontSize: '1.5rem',
              padding: '1.2rem',
              borderRadius: 10,
              border: '1px solid #333',
              background: '#222',
              color: '#fff',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 12 }}>Hedgemasters (comma separated)</label>
          <input
            type="text"
            value={hedgemasters}
            onChange={e => setHedgemasters(e.target.value)}
            style={{
              width: '100%',
              fontSize: '1.5rem',
              padding: '1.2rem',
              borderRadius: 10,
              border: '1px solid #333',
              background: '#222',
              color: '#fff',
            }}
          />
        </div>
      </div>
      <div style={{ marginBottom: '2.5rem' }}>
        <label style={{ display: 'block', marginBottom: 12 }}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            fontSize: '1.4rem',
            padding: '1.2rem',
            borderRadius: 10,
            border: '1px solid #333',
            background: '#222',
            color: '#fff',
            resize: 'vertical',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '3rem', marginBottom: '2.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 12 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%',
              fontSize: '1.4rem',
              padding: '1.2rem',
              borderRadius: 10,
              border: '1px solid #333',
              background: '#222',
              color: '#fff',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 12 }}>Time</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{
              width: '100%',
              fontSize: '1.4rem',
              padding: '1.2rem',
              borderRadius: 10,
              border: '1px solid #333',
              background: '#222',
              color: '#fff',
            }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '3rem', marginBottom: '2.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 12 }}>Select Team Members</label>
          <div style={{
            background: '#232323',
            borderRadius: 10,
            minHeight: 100,
            padding: 10,
            border: '1px solid #333',
          }}>
            {candidateMembers.length === 0 && (
              <div style={{ color: '#888', fontStyle: 'italic' }}>No candidates</div>
            )}
            {candidateMembers.map(user => (
              <div
                key={user.id}
                style={{
                  padding: '1rem',
                  margin: '0.5rem 0',
                  borderRadius: 8,
                  background: '#292929',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'background 0.2s',
                }}
                onClick={() => handleAddMember(user)}
              >
                {user.name}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 12 }}>Team Members</label>
          <div style={{
            background: '#232323',
            borderRadius: 10,
            minHeight: 100,
            padding: 10,
            border: '1px solid #333',
          }}>
            {teamMembers.length === 0 && (
              <div style={{ color: '#888', fontStyle: 'italic' }}>No team members selected</div>
            )}
            {teamMembers.map(user => (
              <div
                key={user.id}
                style={{
                  padding: '1rem',
                  margin: '0.5rem 0',
                  borderRadius: 8,
                  background: '#1a3a2a',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'background 0.2s',
                }}
                onClick={() => handleRemoveMember(user)}
              >
                {user.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        type="submit"
        style={{
          width: '100%',
          padding: '1.5rem',
          fontSize: '1.6rem',
          borderRadius: 10,
          border: 'none',
          background: '#2e8b57',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '1.5rem',
          letterSpacing: 1,
        }}
      >
        Propose Hedge
      </button>
    </form>
  );
}