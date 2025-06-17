import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [msg, setMsg] = useState("");
  const [users, setUsers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  // Fetch users
  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [msg]); // refetch on msg change (after signup)

  // Helper for switching modes and clearing fields
  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setMsg("");
    setUsername("");
    setUserid("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const endpoint = mode === "login" ? "/login" : "/signup";
    try {
      const res = await fetch(`${API_URL}/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, userid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMsg(mode === "login" ? "Logged in!" : "Account created!");
      if (mode === "login") setLoggedIn(true);
      // Refetch users after signup
      if (mode === "signup") {
        setTimeout(() => setMsg(""), 2000);
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (loggedIn) {
    // Main menu after login
    return (
      <div style={{
        background: "#18181b", color: "#fff", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "#232337", padding: 40, borderRadius: 12, boxShadow: "0 2px 24px #000a"
        }}>
          <h2 style={{ color: "#a5b4fc", textAlign: "center" }}>Welcome, {username}!</h2>
          <div style={{
            display: "flex", flexDirection: "column", gap: 16, marginTop: 32, minWidth: 320
          }}>
            <button style={mainBtn}>Indicate When I'm Unavailable</button>
            <button style={mainBtn}>View Upcoming Hedges</button>
            <button style={mainBtn}>Propose a Hedge</button>
            <button style={mainBtn}>Check on My Hedges</button>
            <button style={mainBtn}>Check My Messages</button>
          </div>
        </div>
      </div>
    );
  }

  // Login/Create User UI with user list sidebar
  return (
    <div style={{
      background: "#18181b", color: "#fff", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#27272a", padding: 32, borderRadius: 8, minWidth: 320, marginRight: 32
      }}>
        <h2>{mode === "login" ? "Log In" : "Create Account"}</h2>
        <input placeholder="User Name" value={username} onChange={e => setUsername(e.target.value)} style={{ width: "100%", margin: 8, padding: 8 }} />
        <input placeholder="User ID" value={userid} onChange={e => setUserid(e.target.value)} style={{ width: "100%", margin: 8, padding: 8 }} />
        <button type="submit" style={{ width: "100%", margin: 8, padding: 8 }}>{mode === "login" ? "Log In" : "Sign Up"}</button>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: "#818cf8", cursor: "pointer" }} onClick={switchMode}>
            {mode === "login" ? "Don't have an account? Create one" : "Already have an account? Log in"}
          </span>
        </div>
        {msg && <div style={{ color: msg.includes("!") ? "lime" : "red", marginTop: 8 }}>{msg}</div>}
      </form>
      {/* User list sidebar */}
      <div style={{
        width: 240, height: 400, background: "#232337", borderRadius: 8, overflowY: "auto", padding: 16,
        display: "flex", flexDirection: "column"
      }}>
        <h4 style={{ color: "#a5b4fc", margin: 0 }}>Current Users</h4>
        <div style={{ flex: 1, marginTop: 12 }}>
          {users.length === 0 && <div style={{ color: "#aaa" }}>No users yet</div>}
          {users.map(u =>
            <div key={u.userid} style={{
              padding: "8px 0", borderBottom: "1px solid #333", fontSize: 16
            }}>
              <span style={{ color: "#fff" }}>{u.username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const mainBtn = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "18px 0",
  fontSize: 18,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.2s",
  boxShadow: "0 2px 8px #0003"
};
