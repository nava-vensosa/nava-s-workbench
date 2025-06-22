import { useState, useEffect } from "react";
import CalendarAvailability from "./CalendarAvailability.jsx";
import LabCalendar from "./LabCalendar.jsx";
import ProposeHedge from "./ProposeHedge.jsx";
import MyHedges from "./MyHedges.jsx";
import Messages from "./Messages.jsx";

const API_URL = import.meta.env.VITE_API_URL;

// Dummy data for hedges/messages until backend endpoints exist:
const DUMMY_HEDGES = [
  {
    id: "1",
    title: "Project Orion Sync",
    description: "Discuss weekly progress and blockers.",
    hedgemasters: ["abc123"],
    team_members: ["abc123", "def456"],
    interested_attendees: ["def456"],
    calendar: [{ date: "2025-06-18", start: "14:00", end: "15:00" }]
  },
  {
    id: "2",
    title: "Lab Brainstorm",
    description: "Open ideas and experiment proposals.",
    hedgemasters: ["def456"],
    team_members: ["abc123"],
    interested_attendees: [],
    calendar: [{ date: "2025-06-20", start: "10:00", end: "11:30" }]
  }
];

const DUMMY_MESSAGES = [
  { from: "abc123", to: "def456", text: "Can we reschedule?", date: "2025-06-18" },
  { from: "bot", to: "abc123", text: "You have 2 meetings this week.", date: "2025-06-16" }
];

export default function App() {
  const [loading, setLoading] = useState(true); // NEW
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [msg, setMsg] = useState("");
  const [users, setUsers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState("menu"); // controls menu/subpages
  // Demo state for features
  const [hedges, setHedges] = useState(DUMMY_HEDGES);
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [availability, setAvailability] = useState([]); // implement later

  // Backend ping check (wait for backend server before showing UI)
  useEffect(() => {
    let cancelled = false;
    async function checkBackend() {
      try {
        const res = await fetch(`${API_URL}/api/ping`);
        const data = await res.json();
        if (!cancelled && data.status === "ok") setLoading(false);
      } catch {
        setTimeout(checkBackend, 2000); // Retry after 2s if failed
      }
    }
    checkBackend();
    return () => { cancelled = true; };
  }, []);

  // Fetch users
  useEffect(() => {
    if (loading) return;
    fetch(`${API_URL}/api/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [msg, loading]); // refetch on msg change (after signup)

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

  if (loading) {
    return (
      <div style={{
        background: "#18181b", color: "#fff", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "#232337", padding: 40, borderRadius: 12,
          boxShadow: "0 2px 24px #000a", textAlign: "center"
        }}>
          <h2 style={{ color: "#a5b4fc" }}>Loading…</h2>
          <p>Waiting for server to be ready…</p>
        </div>
      </div>
    );
  }

  // Main menu after login
  if (loggedIn) {
    // Show feature views if not on menu
    if (view === "calendar") {
      return (
        <Centered>
          <CalendarAvailability
            username={username}
            userid={userid}
            availability={availability}
            setAvailability={setAvailability}
            onBack={() => setView("menu")}
          />
        </Centered>
      );
    }
    if (view === "labcalendar") {
      return (
        <Centered>
          <LabCalendar
            hedges={hedges}
            username={username}
            userid={userid}
            setHedges={setHedges}
            users={users}
            onBack={() => setView("menu")}
          />
        </Centered>
      );
    }
    if (view === "propose") {
      return (
        <Centered>
          <ProposeHedge
            users={users}
            hedges={hedges}
            setHedges={setHedges}
            userid={userid}
            onBack={() => setView("menu")}
          />
        </Centered>
      );
    }
    if (view === "myhedges") {
      return (
        <Centered>
          <MyHedges
            hedges={hedges}
            setHedges={setHedges}
            userid={userid}
            users={users}
            onBack={() => setView("menu")}
          />
        </Centered>
      );
    }
    if (view === "messages") {
      return (
        <Centered>
          <Messages
            username={username}
            userid={userid}
            messages={messages}
            setMessages={setMessages}
            users={users}
            onBack={() => setView("menu")}
          />
        </Centered>
      );
    }
    // Main menu
    return (
      <Centered>
        <div style={{
          background: "#232337", padding: 40, borderRadius: 12, boxShadow: "0 2px 24px #000a"
        }}>
          <h2 style={{ color: "#a5b4fc", textAlign: "center" }}>Welcome, {username}!</h2>
          <div style={{
            display: "flex", flexDirection: "column", gap: 16, marginTop: 32, minWidth: 320
          }}>
            <button style={mainBtn} onClick={() => setView("calendar")}>Indicate When I'm Unavailable</button>
            <button style={mainBtn} onClick={() => setView("labcalendar")}>View Upcoming Hedges</button>
            <button style={mainBtn} onClick={() => setView("propose")}>Propose a Hedge</button>
            <button style={mainBtn} onClick={() => setView("myhedges")}>Check on My Hedges</button>
            <button style={mainBtn} onClick={() => setView("messages")}>Check My Messages</button>
            <button style={miniBtn} onClick={() => { setLoggedIn(false); setUsername(""); setUserid(""); setView("menu"); }}>Log Out</button>
          </div>
        </div>
      </Centered>
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
        <input
          placeholder="User Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", margin: 8, padding: 8 }}
        />
        <input
          placeholder="User ID"
          value={userid}
          onChange={e => setUserid(e.target.value)}
          style={{ width: "100%", margin: 8, padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", margin: 8, padding: 8 }}>
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>
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

function Centered({ children }) {
  return (
    <div style={{
      background: "#18181b", color: "#fff", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      {children}
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

const miniBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "10px 0",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 24
};
