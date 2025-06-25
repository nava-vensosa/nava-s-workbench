import React, { useState } from 'react';

const users = [
  // Replace with your actual user data
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'Dana' },
];

export default function HedgeForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [hedgemaster, setHedgemaster] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({
      name,
      hedgemaster,
      description,
      date,
      time,
      teamMembers: teamMembers.map(u => u.name),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#181818',
        color: '#fff',
        padding: '2rem',
        borderRadius: '1rem',
        maxWidth: 600,
        margin: '2rem auto',
        fontFamily: 'sans-serif',
        boxShadow: '0 0 24px #000a',
      }}
    >
      <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Propose a Hedge</h2>
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: '1.1rem' }}>
          What's the Name of your Hedge?
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            width: '100%',
            fontSize: '1.3rem',
            padding: '1rem',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#222',
            color: '#fff',
          }}
        />
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: '1.1rem' }}>
          Who's the Hedgemaster?
        </label>
        <input
          type="text"
          value={hedgemaster}
          onChange={e => setHedgemaster(e.target.value)}
          style={{
            width: '100%',
            fontSize: '1.3rem',
            padding: '1rem',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#222',
            color: '#fff',
          }}
        />
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: '1.1rem' }}>
          Write a Brief Description of the Hedge
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          style={{
            width: '100%',
            fontSize: '1.2rem',
            padding: '1rem',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#222',
            color: '#fff',
            resize: 'vertical',
          }}
        />
      </div>
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '1.1rem' }}>
            Select Any Critical Team Members
          </label>
          <div style={{
            background: '#232323',
            borderRadius: 8,
            minHeight: 80,
            padding: 8,
            border: '1px solid #333',
          }}>
            {candidateMembers.length === 0 && (
              <div style={{ color: '#888', fontStyle: 'italic' }}>No candidates</div>
            )}
            {candidateMembers.map(user => (
              <div
                key={user.id}
                style={{
                  padding: '0.7rem 1rem',
                  margin: '0.3rem 0',
                  borderRadius: 6,
                  background: '#292929',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
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
          <label style={{ display: 'block', marginBottom: 8, fontSize: '1.1rem' }}>
            Team Members
          </label>
          <div style={{
            background: '#232323',
            borderRadius: 8,
            minHeight: 80,
            padding: 8,
            border: '1px solid #333',
          }}>
            {teamMembers.length === 0 && (
              <div style={{ color: '#888', fontStyle: 'italic' }}>No team members selected</div>
            )}
            {teamMembers.map(user => (
              <div
                key={user.id}
                style={{
                  padding: '0.7rem 1rem',
                  margin: '0.3rem 0',
                  borderRadius: 6,
                  background: '#1a3a2a',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
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
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '1.1rem' }}>
            Select a Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%',
              fontSize: '1.2rem',
              padding: '1rem',
              borderRadius: 8,
              border: '1px solid #333',
              background: '#222',
              color: '#fff',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '1.1rem' }}>
            Select a Time
          </label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{
              width: '100%',
              fontSize: '1.2rem',
              padding: '1rem',
              borderRadius: 8,
              border: '1px solid #333',
              background: '#222',
              color: '#fff',
            }}
          />
        </div>
      </div>
      <button
        type="submit"
        style={{
          width: '100%',
          padding: '1.2rem',
          fontSize: '1.3rem',
          borderRadius: 8,
          border: 'none',
          background: '#2e8b57',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '1rem',
          letterSpacing: 1,
        }}
      >
        Propose Hedge
      </button>
    </form>
  );
}