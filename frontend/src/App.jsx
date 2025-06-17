import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL; // Set this in Vercel!

export default function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [userid, setUserid] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const endpoint = mode === 'login' ? '/login' : '/signup';
    try {
      const res = await fetch(`${API_URL}/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, userid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setSuccess(mode === 'login' ? 'Logged in!' : 'Account created!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      background: '#18181b',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#27272a', padding: 32, borderRadius: 8, boxShadow: '0 4px 32px #0007'
      }}>
        <h1>{mode === 'login' ? 'Log In' : 'Create Account'}</h1>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="User Name" style={{ margin: 8, padding: 8, borderRadius: 4, width: '100%' }} />
        <input value={userid} onChange={e => setUserid(e.target.value)} placeholder="User ID" style={{ margin: 8, padding: 8, borderRadius: 4, width: '100%' }} />
        <button type="submit" style={{ margin: 8, padding: 8, borderRadius: 4, background: '#3f3f46', color: '#fff', width: '100%' }}>
          {mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>
        <div style={{ marginTop: 16 }}>
          <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }} style={{ color: '#818cf8', cursor: 'pointer' }}>
            {mode === 'login' ? "Don't have an account? Create one" : "Already have an account? Log in"}
          </span>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        {success && <div style={{ color: 'lime', marginTop: 8 }}>{success}</div>}
      </form>
    </div>
  );
}
